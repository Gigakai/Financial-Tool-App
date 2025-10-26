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
                    row.monto = parseFloat(row.monto);
                    if (row.tipo === 'gasto') {
                        transactions.push(row);
                    }
                }
            })
            .on('end', () => {
                if (transactions.length === 0) {
                    resolve(0);
                    return;
                }
                // --- MODIFICACIÓN 1: Parsear fechas M/D/YYYY ---
                const months = new Set(transactions.map(t => {
                    const parts = t.fecha.split('/'); // [M, D, YYYY]
                    const year = parts[2];
                    const month = parts[0].padStart(2, '0'); // Asegura que el mes tenga 2 dígitos (ej. '08')
                    return `${year}-${month}`;
                }));
                const totalMonths = months.size > 0 ? months.size : 1;

                const totalExpenses = transactions.reduce((acc, t) => acc + t.monto, 0);
                resolve(totalExpenses / totalMonths);
            })
            .on('error', reject);
    });
}

function getBufferMonthsFromProfile(riskProfile: string): number {
    switch (riskProfile.toLowerCase()) {
        case 'low':
            return 12;
        case 'medium':
            return 6;
        case 'high':
            return 3;
        default:
            return 6;
    }
}
export async function calculateRisk(empresa_id: string, recurringCost: number, oneTimeCost: number) {
    // ...existing code...
    const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    const companyState = allStates[empresa_id];
    if (!companyState) {
        throw new Error(`No hay datos de estado para la empresa con id: ${empresa_id}`);
    }
    const { currentCash, riskProfile } = companyState;
    const targetRunway = getBufferMonthsFromProfile(riskProfile);
    const monthlyBurn = await getAverageMonthlyBurn(empresa_id);
    const newMonthlyBurn = monthlyBurn + recurringCost;
    const cashAfterCost = currentCash - oneTimeCost;
    if (newMonthlyBurn <= 0) {
        return { score: 10, riskLevel: 'Muy Bajo', runwayMonths: Infinity, explanation: 'No tienes gastos recurrentes significativos.' };
    }
    const runwayMonths = cashAfterCost / newMonthlyBurn;
    let score: number;
    let riskLevel: string;
    if (runwayMonths >= targetRunway * 1.5) {
        score = 9;
        riskLevel = 'Bajo';
    } else if (runwayMonths >= targetRunway) {
        score = 6;
        riskLevel = 'Moderado';
    } else if (runwayMonths >= targetRunway * 0.5) {
        score = 3;
        riskLevel = 'Alto';
    } else {
        score = 1;
        riskLevel = 'Crítico';
    }
    const explanation = `Considerando tu perfil de riesgo '${riskProfile}', tu objetivo de reserva es de ${targetRunway} meses. Esta decisión llevaría tu reserva a ${runwayMonths.toFixed(1)} meses.`;
    return { score, riskLevel, runwayMonths, explanation };
}


// ... (código existente de getAverageMonthlyBurn, getBufferMonthsFromProfile, calculateRisk) ...

// ... (código existente de getAverageMonthlyBurn, getBufferMonthsFromProfile, calculateRisk) ...

export async function checkForFinancialAlerts(empresa_id: string): Promise<any[]> {
    const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    const companyState = allStates[empresa_id];

    if (!companyState) {
        return []; // No hay datos de la empresa
    }

    const budgets = companyState.budgets || {};
    const actualSpending: { [key: string]: number } = {};
    const alerts: any[] = [];

    // --- MEJORA 1: Lógica de Alerta de Flujo de Caja Negativo ---
    const currentCash = companyState.currentCash;
    const monthlyBurn = await getAverageMonthlyBurn(empresa_id);
    const dailyBurn = monthlyBurn / 30; // Gasto diario promedio

    if (dailyBurn > 0) {
        let projectedCash = currentCash;
        for (let day = 1; day <= 30; day++) { // Proyectamos a 30 días
            projectedCash -= dailyBurn;
            if (projectedCash < 0) {
                alerts.push({
                    type: 'CASHFLOW_WARNING',
                    severity: 'Crítico',
                    message: `¡Alerta Crítica! A este ritmo de gasto, tu flujo de caja será negativo en aproximadamente ${day} días.`
                });
                break; // Solo necesitamos alertar la primera vez que ocurre
            }
        }
    }

    // --- Lógica de Alertas de Presupuesto (Mejorada) ---
    return new Promise((resolve, reject) => {
        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                const dateParts = row.fecha.split('/');
                const month = parseInt(dateParts[0]);
                const year = parseInt(dateParts[2]);
                const isCurrentMonth = (month === 10 && year === 2025);

                if (row.empresa_id === empresa_id && row.tipo === 'gasto' && isCurrentMonth) {
                    const amount = parseFloat(row.monto);
                    actualSpending[row.categoria] = (actualSpending[row.categoria] || 0) + amount;
                }
            })
            .on('end', () => {
                // --- MEJORA 2: Lógica de Alerta de Ritmo de Gasto (Pacing) ---
                const currentDay = 25; // Asumimos que hoy es 25
                const daysInMonth = 31; // Octubre
                const monthProgress = currentDay / daysInMonth; // ~80% del mes ha pasado

                for (const category in budgets) {
                    const budget = budgets[category];
                    const spent = actualSpending[category] || 0;

                    // Alerta 1: Presupuesto ya excedido (la que ya tenías)
                    if (spent > budget) {
                        const variance = ((spent / budget) * 100).toFixed(0);
                        alerts.push({
                            type: 'BUDGET_EXCEEDED',
                            severity: 'Alto',
                            category: category,
                            message: `¡Alerta! Se ha superado el presupuesto de '${category}'. Gasto actual: $${spent.toFixed(0)} de un presupuesto de $${budget} (${variance}%).`
                        });
                    } 
                    // Alerta 2: Ritmo de gasto es demasiado rápido
                    else {
                        const budgetSpentPercentage = spent / budget;
                        // Alerta si el gasto % es mucho mayor que el tiempo % transcurrido
                        if (budgetSpentPercentage > monthProgress * 1.2) { // Ej: si el gasto va un 20% más rápido que el tiempo
                             alerts.push({
                                type: 'PACING_WARNING',
                                severity: 'Medio',
                                category: category,
                                message: `Atención: El ritmo de gasto en '${category}' es muy alto. Ya se ha consumido un ${(budgetSpentPercentage * 100).toFixed(0)}% del presupuesto cuando solo ha pasado un ${(monthProgress * 100).toFixed(0)}% del mes.`
                            });
                        }
                    }
                }
                resolve(alerts);
            })
            .on('error', reject);
    });
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