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