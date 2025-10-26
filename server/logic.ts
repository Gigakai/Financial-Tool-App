import fs from 'fs';
import csv from 'csv-parser';

interface Transaction {
    empresa_id: string;
    fecha: string;
    tipo: 'ingreso' | 'gasto';
    concepto: string;
    categoria: string;
    monto: number;
}

// Función para leer los datos y calcular el gasto mensual promedio
async function getAverageMonthlyBurn(empresa_id: string): Promise<number> {
    const transactions: Transaction[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {

                if (row.empresa_id === empresa_id) {
                    // Convertir monto a número
                    row.monto = parseFloat(row.monto);
                    if (row.tipo === 'gasto') {
                        transactions.push(row);
                    }
                }
            })
            .on('end', () => {
                if (transactions.length === 0) {
                    // No hay gastos para esta empresa, el burn rate es 0
                    resolve(0);
                    return;
                }
                // Calcular meses únicos en los datos
                const months = new Set(transactions.map(t => t.fecha.substring(0, 7))); // YYYY-MM
                const totalMonths = months.size > 0 ? months.size : 1;

                const totalExpenses = transactions.reduce((acc, t) => acc + t.monto, 0);
                resolve(totalExpenses / totalMonths);
            })
            .on('error', reject);
    });
}

function getBufferMonthsFromProfile(riskProfile: string): number {
    switch (riskProfile.toLowerCase()) {
        case 'low': // Perfil conservador, quiere más seguridad
            return 12;
        case 'medium': // Perfil moderado, balanceado
            return 6;
        case 'high': // Perfil agresivo, dispuesto a arriesgar
            return 3;
        default:
            return 6; // Un valor por defecto seguro
    }
}

// El corazón del Risk-Grader
export async function calculateRisk(empresa_id: string, recurringCost: number, oneTimeCost: number) {
    const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    const companyState = allStates[empresa_id];

    if (!companyState) {
        throw new Error(`No hay datos de estado para la empresa con id: ${empresa_id}`);
    }

    // Extraemos los nuevos datos del estado
    const {currentCash, riskProfile} = companyState;
    const targetRunway = getBufferMonthsFromProfile(riskProfile); // Obtenemos el objetivo de la empresa

    const monthlyBurn = await getAverageMonthlyBurn(empresa_id);

    const newMonthlyBurn = monthlyBurn + recurringCost;
    const cashAfterCost = currentCash - oneTimeCost;

    if (newMonthlyBurn <= 0) {
        return {
            score: 10,
            riskLevel: 'Muy Bajo',
            runwayMonths: Infinity,
            explanation: 'No tienes gastos recurrentes significativos.'
        };
    }

    const runwayMonths = cashAfterCost / newMonthlyBurn;

    let score: number;
    let riskLevel: string;

    // La calificación ahora se basa en el objetivo de la empresa (targetRunway)
    if (runwayMonths >= targetRunway * 1.5) { // Mucho mejor que el objetivo
        score = 9;
        riskLevel = 'Bajo';
    } else if (runwayMonths >= targetRunway) { // Cumple o supera el objetivo
        score = 6;
        riskLevel = 'Moderado';
    } else if (runwayMonths >= targetRunway * 0.5) { // Por debajo del objetivo, pero no crítico
        score = 3;
        riskLevel = 'Alto';
    } else { // Muy por debajo del objetivo
        score = 1;
        riskLevel = 'Crítico';
    }

    const explanation = `Considerando tu perfil de riesgo '${riskProfile}', tu objetivo de reserva es de ${targetRunway} meses. Esta decisión llevaría tu reserva a ${runwayMonths.toFixed(1)} meses.`;

    return {score, riskLevel, runwayMonths, explanation};
}


// Funciones para la herramienta del "Analista"

// logic.ts

// Convierte un string a Date considerando formato MM/DD/YYYY
function parseHackathonDate(dateString: string): Date {
    const clean = dateString.trim();
    const [month, day, year] = clean.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Fecha UTC coherente
}

function subtractDaysUTC(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() - days);
    return result;
}

function checkDate(
    fechaCSV: string,
    timePeriod: string,
    startDate?: string,
    endDate?: string
): boolean {
    try {
        const txDate = parseHackathonDate(fechaCSV);
        if (isNaN(txDate.getTime())) return false;

        // 1️⃣ Si hay startDate / endDate, se usa eso con prioridad
        if (startDate || endDate) {
            let startMatch = true;
            let endMatch = true;

            if (startDate) {
                const start = parseHackathonDate(startDate);
                startMatch = txDate >= start;
            }
            if (endDate) {
                const end = parseHackathonDate(endDate);
                endMatch = txDate <= end;
            }
            return startMatch && endMatch;
        }

        // 2️⃣ Si no hay rango manual, usar el periodo relativo
        const today = new Date(Date.UTC(2025, 9, 25, 0, 0, 0)); // Fijo para pruebas (Oct 25, 2025 UTC)
        // En prod → const today = new Date();

        if (timePeriod === 'current_month') {
            return (
                txDate.getUTCFullYear() === today.getUTCFullYear() &&
                txDate.getUTCMonth() === today.getUTCMonth()
            );
        }

        if (timePeriod === 'last_30_days') {
            const start = subtractDaysUTC(today, 30);
            return txDate >= start && txDate <= today;
        }

        if (timePeriod === 'last_90_days') {
            const start = subtractDaysUTC(today, 90);
            return txDate >= start && txDate <= today;
        }

        return false;
    } catch (e: any) {
        console.error(`Error en checkDate: ${e.message}`);
        return false;
    }
}

export async function getSummary(
    empresa_id: string,
    tipo: 'ingreso' | 'gasto',
    timePeriod: string,
    categoria?: string,
    startDate?: string,
    endDate?: string
) {
    const transactions: Transaction[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (row.empresa_id === empresa_id && row.tipo === tipo) {
                    if (categoria && row.categoria.toLowerCase() !== categoria.toLowerCase()) {
                        return;
                    }

                    if (!checkDate(row.fecha, timePeriod, startDate, endDate)) {
                        return;
                    }

                    transactions.push({ ...row, monto: parseFloat(row.monto) });
                }
            })
            .on('end', () => {
                const totalAmount = transactions.reduce((acc, t) => acc + t.monto, 0);
                const sorted = [...transactions].sort((a, b) => b.monto - a.monto);
                const topTransactions = sorted.slice(0, 3).map(t => ({
                    fecha: t.fecha,
                    concepto: t.concepto,
                    monto: t.monto
                }));

                resolve({
                    totalAmount: parseFloat(totalAmount.toFixed(2)),
                    transactionCount: transactions.length,
                    topTransactions
                });
            })
            .on('error', reject);
    });
}

// Funciones de herramienta adicionales
export async function calculateHealthReport(empresa_id: string) {

    // 1. Obtener datos base del estado
    const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    const companyState = allStates[empresa_id];
    if (!companyState) {
        throw new Error(`No hay datos de estado para la empresa ${empresa_id}`);
    }

    const { currentCash, riskProfile, budgets } = companyState;
    const keyInsights: string[] = []; // Aquí guardaremos las recomendaciones

    // --- 2. ANÁLISIS DE RUNWAY (Flujo de Caja) ---
    // Reutilizamos la lógica del Risk-Grader
    const monthlyBurn = await getAverageMonthlyBurn(empresa_id);
    const currentRunwayMonths = (monthlyBurn > 0) ? (currentCash / monthlyBurn) : Infinity;
    const targetRunway = getBufferMonthsFromProfile(riskProfile);

    let runwayStatus = 'Saludable';
    if (currentRunwayMonths < targetRunway * 0.5) {
        runwayStatus = 'Crítico';
        keyInsights.push(`Riesgo Crítico de Flujo de Caja: Tu reserva actual es de ${currentRunwayMonths.toFixed(1)} meses, lo cual está muy por debajo de tu objetivo de ${targetRunway} meses.`);
    } else if (currentRunwayMonths < targetRunway) {
        runwayStatus = 'Riesgo';
        keyInsights.push(`Riesgo de Flujo de Caja: Tu reserva actual de ${currentRunwayMonths.toFixed(1)} meses está por debajo de tu objetivo de ${targetRunway} meses.`);
    } else {
        keyInsights.push(`Salud de Flujo de Caja: Tu reserva de ${currentRunwayMonths.toFixed(1)} meses es saludable y supera tu objetivo de ${targetRunway} meses.`);
    }

    // --- 3. ANÁLISIS DE PRESUPUESTOS (Control de Gastos) ---
    // Reutilizamos la lógica del Analista (getSummary)
    const budgetStatus: any[] = [];
    const highRiskCategories: string[] = [];

    // Usamos 'for...of' con 'Object.keys' para poder usar 'await' dentro del loop
    for (const category of Object.keys(budgets)) {
        const budgetAmount = budgets[category];

        // Llamamos a getSummary para el mes actual y esta categoría
        const summary: any = await getSummary(empresa_id, 'gasto', 'current_month', category);
        const spentAmount = summary.totalAmount;

        let percentage = 0;
        if (budgetAmount > 0) { // Evitar división por cero
             percentage = (spentAmount / budgetAmount) * 100;
        }

        let status = 'OK';
        if (percentage >= 95) { // 95% o más
            status = 'Riesgo Alto';
            highRiskCategories.push(category);
        } else if (percentage >= 80) { // 80% - 94.9%
            status = 'Advertencia';
        }

        budgetStatus.push({
            category,
            budgeted: budgetAmount,
            spent: spentAmount,
            percentage: parseFloat(percentage.toFixed(1)),
            status: status
        });
    }

    if (highRiskCategories.length > 0) {
        keyInsights.push(`Riesgo de Presupuesto: Estás a punto de exceder tu presupuesto del mes actual en: ${highRiskCategories.join(', ')}.`);
    } else {
        keyInsights.push(`Control de Presupuestos: Tus gastos del mes actual están bajo control.`);
    }


    // --- 4. DEVOLVER EL JSON ESTRUCTURADO PARA EL LLM ---
    return {
        healthAnalysis: {
            runway: {
                currentMonths: parseFloat(currentRunwayMonths.toFixed(1)),
                targetMonths: targetRunway,
                status: runwayStatus,
                currentMonthlyBurn: parseFloat(monthlyBurn.toFixed(2))
            },
            budgets: {
                status: highRiskCategories.length > 0 ? 'Riesgo' : 'Saludable',
                details: budgetStatus
            },
            // Los "insights" son la clave para la respuesta accionable del LLM
            keyInsights: keyInsights
        }
    };
}