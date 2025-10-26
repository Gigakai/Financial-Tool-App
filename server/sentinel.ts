import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import twilio from 'twilio';

dotenv.config();

let pool: mysql.Pool | null = null;

function initDbPool() {
    if (pool) return pool;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;

    if (!host || !user || !database) {
        return null;
    }

    try {
        pool = mysql.createPool({ host, port, user, password, database, connectionLimit: 5 });
        return pool;
    } catch (e: any) {
        console.error('Error al crear el pool MySQL:', e.message);
        pool = null;
        return null;
    }
}

interface Transaction {
    empresa_id: string;
    fecha: string;
    tipo: 'ingreso' | 'gasto';
    concepto: string;
    categoria: string;
    monto: number;
}

export interface SentinelAlert {
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    category: string;
    title: string;
    description: string;
    severity: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    timestamp: string;
    actionable: boolean;
    recommendation?: string;
    metadata?: any;
}

// Helper para formatear Date a YYYY-MM-DD (SQL)
function formatDateForSql(d: Date) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Convierte un string a Date considerando formato MM/DD/YYYY
function parseHackathonDate(dateString: string): Date {
    const clean = dateString.trim();
    const [month, day, year] = clean.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

function subtractDaysUTC(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() - days);
    return result;
}

// Obtener transacciones del último período
async function getRecentTransactions(empresa_id: string, days: number = 30): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const poolLocal = initDbPool();
    const today = new Date(Date.UTC(2025, 9, 25, 0, 0, 0)); // Oct 25, 2025 UTC
    const startDate = subtractDaysUTC(today, days);

    if (poolLocal) {
        try {
            const sql = `
                SELECT fecha, tipo, concepto, categoria, CAST(monto AS DECIMAL(18,2)) as monto
                FROM databanorte
                WHERE empresa_id = ? AND fecha >= ?
                ORDER BY fecha DESC
            `;
            const [rows]: any = await poolLocal.query(sql, [empresa_id, formatDateForSql(startDate)]);
            
            for (const r of rows) {
                transactions.push({
                    empresa_id,
                    fecha: formatDateForSql(new Date(r.fecha)),
                    tipo: r.tipo,
                    concepto: r.concepto,
                    categoria: r.categoria,
                    monto: parseFloat(r.monto)
                });
            }
            return transactions;
        } catch (e: any) {
            console.error('Error en getRecentTransactions (MySQL):', e.message);
        }
    }

    // CSV fallback
    return new Promise((resolve) => {
        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (row.empresa_id === empresa_id) {
                    try {
                        const txDate = parseHackathonDate(row.fecha);
                        if (txDate >= startDate && txDate <= today) {
                            transactions.push({
                                empresa_id: row.empresa_id,
                                fecha: row.fecha,
                                tipo: row.tipo,
                                concepto: row.concepto,
                                categoria: row.categoria,
                                monto: parseFloat(row.monto)
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing transaction:', e);
                    }
                }
            })
            .on('end', () => resolve(transactions))
            .on('error', () => resolve(transactions));
    });
}

// Calcular estadísticas por categoría
async function getCategoryStatistics(empresa_id: string, categoria: string, days: number = 90) {
    const transactions = await getRecentTransactions(empresa_id, days);
    const categoryTxs = transactions.filter(t => t.categoria === categoria && t.tipo === 'gasto');
    
    if (categoryTxs.length === 0) {
        return { average: 0, stdDev: 0, max: 0, count: 0 };
    }

    const amounts = categoryTxs.map(t => t.monto);
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        average,
        stdDev,
        max: Math.max(...amounts),
        count: amounts.length
    };
}

// 1. DETECTOR DE ANOMALÍAS EN GASTOS
async function detectExpenseAnomalies(empresa_id: string): Promise<SentinelAlert[]> {
    const alerts: SentinelAlert[] = [];
    const recentTxs = await getRecentTransactions(empresa_id, 30);
    const categories = [...new Set(recentTxs.map(t => t.categoria))];

    for (const categoria of categories) {
        const stats = await getCategoryStatistics(empresa_id, categoria, 90);
        const recentCategoryTxs = recentTxs.filter(t => t.categoria === categoria && t.tipo === 'gasto');

        for (const tx of recentCategoryTxs) {
            // Detectar gastos que están más de 2 desviaciones estándar por encima del promedio
            if (stats.stdDev > 0 && tx.monto > stats.average + (2 * stats.stdDev)) {
                alerts.push({
                    id: `anomaly-${categoria}-${Date.now()}`,
                    type: 'WARNING',
                    category: 'expense-anomaly',
                    title: `Gasto inusual en ${categoria}`,
                    description: `Se detectó un gasto de $${tx.monto.toFixed(2)} en "${tx.concepto}", que es ${((tx.monto / stats.average - 1) * 100).toFixed(0)}% mayor al promedio histórico de $${stats.average.toFixed(2)}.`,
                    severity: 'Alto',
                    timestamp: new Date().toISOString(),
                    actionable: true,
                    recommendation: `Verifica si este gasto era esperado. Si es recurrente, considera actualizar tu presupuesto para "${categoria}".`,
                    metadata: {
                        transaction: tx,
                        historicalAverage: stats.average,
                        deviation: ((tx.monto - stats.average) / stats.stdDev).toFixed(2)
                    }
                });
            }
        }
    }

    return alerts;
}

// 2. DETECTOR DE GASTOS DUPLICADOS
async function detectDuplicateExpenses(empresa_id: string): Promise<SentinelAlert[]> {
    const alerts: SentinelAlert[] = [];
    const recentTxs = await getRecentTransactions(empresa_id, 7); // Últimos 7 días
    const gastos = recentTxs.filter(t => t.tipo === 'gasto');

    // Agrupar por concepto y monto similar
    const grouped = new Map<string, Transaction[]>();
    
    for (const tx of gastos) {
        const key = `${tx.concepto}-${Math.round(tx.monto / 100) * 100}`; // Redondear a centenas
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(tx);
    }

    // Detectar duplicados (mismo concepto y monto similar en pocos días)
    for (const [key, txs] of grouped.entries()) {
        if (txs.length >= 2) {
            const totalAmount = txs.reduce((sum, t) => sum + t.monto, 0);
            alerts.push({
                id: `duplicate-${key}-${Date.now()}`,
                type: 'WARNING',
                category: 'duplicate-expense',
                title: `Posibles gastos duplicados detectados`,
                description: `Se encontraron ${txs.length} transacciones similares de "${txs[0].concepto}" en los últimos 7 días, totalizando $${totalAmount.toFixed(2)}.`,
                severity: 'Medio',
                timestamp: new Date().toISOString(),
                actionable: true,
                recommendation: 'Revisa estas transacciones para verificar que no sean duplicados accidentales.',
                metadata: {
                    transactions: txs,
                    count: txs.length
                }
            });
        }
    }

    return alerts;
}

// 3. PROYECCIÓN DE FLUJO DE CAJA
async function projectCashFlow(empresa_id: string): Promise<SentinelAlert[]> {
    const alerts: SentinelAlert[] = [];
    
    // Obtener estado actual
    const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    const companyState = allStates[empresa_id];
    if (!companyState) return alerts;

    const currentCash = companyState.currentCash;
    const transactions = await getRecentTransactions(empresa_id, 30);
    
    // Calcular gasto diario promedio
    const gastos = transactions.filter(t => t.tipo === 'gasto');
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);
    const dailyBurn = totalGastos / 30;

    // Proyectar a 30 días
    const daysUntilZero = dailyBurn > 0 ? currentCash / dailyBurn : Infinity;

    if (daysUntilZero < 15) {
        alerts.push({
            id: `cashflow-critical-${Date.now()}`,
            type: 'CRITICAL',
            category: 'cashflow',
            title: '⚠️ ALERTA CRÍTICA: Flujo de caja en riesgo',
            description: `A este ritmo de gastos ($${dailyBurn.toFixed(2)}/día), tu saldo llegará a cero en aproximadamente ${Math.floor(daysUntilZero)} días.`,
            severity: 'Crítico',
            timestamp: new Date().toISOString(),
            actionable: true,
            recommendation: `Acciones urgentes: 1) Reducir gastos no esenciales inmediatamente, 2) Acelerar cobros pendientes, 3) Buscar fuentes de financiamiento.`,
            metadata: {
                currentCash,
                dailyBurn,
                daysUntilZero: Math.floor(daysUntilZero)
            }
        });
    } else if (daysUntilZero < 30) {
        alerts.push({
            id: `cashflow-warning-${Date.now()}`,
            type: 'WARNING',
            category: 'cashflow',
            title: 'Advertencia: Flujo de caja bajo proyectado',
            description: `Con tu ritmo actual de gastos, tu saldo será crítico en ${Math.floor(daysUntilZero)} días.`,
            severity: 'Alto',
            timestamp: new Date().toISOString(),
            actionable: true,
            recommendation: 'Considera optimizar gastos y asegurar ingresos para los próximos 30 días.',
            metadata: {
                currentCash,
                dailyBurn,
                daysUntilZero: Math.floor(daysUntilZero)
            }
        });
    }

    return alerts;
}

// 4. COMPARACIÓN CON PROMEDIOS HISTÓRICOS
async function compareWithHistoricalAverages(empresa_id: string): Promise<SentinelAlert[]> {
    const alerts: SentinelAlert[] = [];
    const currentMonthTxs = await getRecentTransactions(empresa_id, 25); // Mes actual (hasta el día 25)
    const last90DaysTxs = await getRecentTransactions(empresa_id, 90);

    // Agrupar por categoría
    const currentByCategory = new Map<string, number>();
    const historicalByCategory = new Map<string, number>();

    currentMonthTxs.filter(t => t.tipo === 'gasto').forEach(t => {
        currentByCategory.set(t.categoria, (currentByCategory.get(t.categoria) || 0) + t.monto);
    });

    last90DaysTxs.filter(t => t.tipo === 'gasto').forEach(t => {
        historicalByCategory.set(t.categoria, (historicalByCategory.get(t.categoria) || 0) + t.monto);
    });

    // Comparar cada categoría
    for (const [categoria, currentAmount] of currentByCategory.entries()) {
        const historicalMonthlyAvg = (historicalByCategory.get(categoria) || 0) / 3; // Promedio de 3 meses
        
        if (historicalMonthlyAvg > 0) {
            const increasePercent = ((currentAmount / historicalMonthlyAvg) - 1) * 100;
            
            // Alerta si el gasto aumentó más de 50%
            if (increasePercent > 50) {
                alerts.push({
                    id: `historical-increase-${categoria}-${Date.now()}`,
                    type: 'WARNING',
                    category: 'budget-overrun',
                    title: `Aumento significativo en ${categoria}`,
                    description: `Los gastos en "${categoria}" este mes ($${currentAmount.toFixed(2)}) son ${increasePercent.toFixed(0)}% mayores que tu promedio histórico ($${historicalMonthlyAvg.toFixed(2)}/mes).`,
                    severity: increasePercent > 100 ? 'Alto' : 'Medio',
                    timestamp: new Date().toISOString(),
                    actionable: true,
                    recommendation: `Analiza qué está causando este aumento. Si es temporal, considéralo normal. Si es permanente, ajusta tu presupuesto.`,
                    metadata: {
                        categoria,
                        currentAmount,
                        historicalAverage: historicalMonthlyAvg,
                        increasePercent: increasePercent.toFixed(1)
                    }
                });
            }
        }
    }

    return alerts;
}

// 5. DETECTOR DE TENDENCIAS NEGATIVAS
async function detectNegativeTrends(empresa_id: string): Promise<SentinelAlert[]> {
    const alerts: SentinelAlert[] = [];
    
    // Obtener últimos 3 meses de datos
    const transactions = await getRecentTransactions(empresa_id, 90);
    
    // Dividir en 3 períodos de 30 días
    const today = new Date(Date.UTC(2025, 9, 25, 0, 0, 0));
    const period1 = transactions.filter(t => {
        const date = new Date(t.fecha);
        const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
    });
    const period2 = transactions.filter(t => {
        const date = new Date(t.fecha);
        const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 30 && diff <= 60;
    });
    const period3 = transactions.filter(t => {
        const date = new Date(t.fecha);
        const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 60 && diff <= 90;
    });

    // Analizar ingresos
    const income1 = period1.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
    const income2 = period2.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
    const income3 = period3.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);

    // Detectar tendencia descendente en ingresos (2 meses consecutivos de caída)
    if (income1 < income2 && income2 < income3 && income3 > 0) {
        const decline = ((income3 - income1) / income3) * 100;
        alerts.push({
            id: `trend-income-decline-${Date.now()}`,
            type: 'WARNING',
            category: 'trend',
            title: 'Tendencia negativa en ingresos',
            description: `Tus ingresos han disminuido ${decline.toFixed(0)}% en los últimos 3 meses (de $${income3.toFixed(2)} a $${income1.toFixed(2)}).`,
            severity: 'Alto',
            timestamp: new Date().toISOString(),
            actionable: true,
            recommendation: 'Identifica las causas de esta caída. ¿Perdiste clientes? ¿Cambió la demanda? Considera estrategias para recuperar ingresos.',
            metadata: {
                month1: income1,
                month2: income2,
                month3: income3,
                declinePercent: decline.toFixed(1)
            }
        });
    }

    return alerts;
}

// FUNCIÓN PRINCIPAL DEL SENTINELA
export async function runSentinelAnalysis(empresa_id: string): Promise<SentinelAlert[]> {
    console.log(`[Sentinel] Iniciando análisis para empresa ${empresa_id}`);
    
    const allAlerts: SentinelAlert[] = [];

    try {
        // Ejecutar todos los detectores en paralelo
        const [
            anomalies,
            duplicates,
            cashflow,
            historical,
            trends
        ] = await Promise.all([
            detectExpenseAnomalies(empresa_id),
            detectDuplicateExpenses(empresa_id),
            projectCashFlow(empresa_id),
            compareWithHistoricalAverages(empresa_id),
            detectNegativeTrends(empresa_id)
        ]);

        allAlerts.push(...anomalies, ...duplicates, ...cashflow, ...historical, ...trends);

        // Ordenar por severidad: Crítico > Alto > Medio > Bajo
        const severityOrder = { 'Crítico': 0, 'Alto': 1, 'Medio': 2, 'Bajo': 3 };
        allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        console.log(`[Sentinel] Análisis completado. ${allAlerts.length} alertas generadas.`);
    } catch (error: any) {
        console.error('[Sentinel] Error durante el análisis:', error.message);
    }

    return allAlerts;
}

// ENVÍO DE ALERTAS POR WHATSAPP
export async function sendWhatsAppAlert(alert: SentinelAlert | any): Promise<boolean> {
    const phoneNumber = process.env.WHATSAPP_NUMBER || '5215512345678';
    
    // Manejar formato de alertas MCP (que tienen 'message' en lugar de 'title' y 'description')
    const title = alert.title || `Alerta: ${alert.category || 'Financiera'}`;
    const description = alert.description || alert.message || 'Alerta del sistema';
    const severity = alert.severity || 'Alto';
    
    // Formatear mensaje
    const message = `
🚨 *ALERTA SENTINELA*

*${title}*

${description}

📊 Severidad: *${severity}*
⏰ ${new Date(alert.timestamp || new Date()).toLocaleString('es-MX')}

${alert.recommendation ? `💡 *Recomendación:*\n${alert.recommendation}` : ''}
    `.trim();

    console.log(`\n[Sentinel] 📱 Enviando alerta por WhatsApp a +${phoneNumber}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar si Twilio está configurado
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
        console.log('[Sentinel] ⚠️  Twilio no configurado. WhatsApp solo simulado (ver mensaje arriba).');
        console.log('[Sentinel] 💡 Para activar WhatsApp real:');
        console.log('[Sentinel]    1. Ve a https://www.twilio.com/try-twilio');
        console.log('[Sentinel]    2. Crea cuenta gratuita');
        console.log('[Sentinel]    3. Copia ACCOUNT_SID y AUTH_TOKEN a tu .env');
        console.log('[Sentinel]    4. Conecta tu número al Twilio Sandbox\n');
        return false;
    }

    try {
        // Inicializar cliente de Twilio
        const client = twilio(accountSid, authToken);

        // Enviar mensaje
        const twilioMessage = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:+${phoneNumber}`,
            body: message
        });

        console.log(`[Sentinel] ✅ WhatsApp enviado exitosamente!`);
        console.log(`[Sentinel] 📱 Message SID: ${twilioMessage.sid}\n`);
        
        return true;
    } catch (error: any) {
        console.error(`[Sentinel] ❌ Error enviando WhatsApp: ${error.message}`);
        
        // Mensajes de error más específicos
        if (error.code === 21608) {
            console.error('[Sentinel] 💡 El número no está registrado en el Twilio Sandbox.');
            console.error('[Sentinel]    Envía "join <sandbox-code>" desde tu WhatsApp a +1 415 523 8886\n');
        } else if (error.code === 20003) {
            console.error('[Sentinel] 💡 Credenciales de Twilio inválidas. Verifica ACCOUNT_SID y AUTH_TOKEN\n');
        } else {
            console.error('[Sentinel] 💡 Error:', error.message, '\n');
        }
        
        return false;
    }
}
