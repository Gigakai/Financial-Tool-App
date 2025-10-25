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
    const { currentCash, riskProfile } = companyState;
    const targetRunway = getBufferMonthsFromProfile(riskProfile); // Obtenemos el objetivo de la empresa

    const monthlyBurn = await getAverageMonthlyBurn(empresa_id);

    const newMonthlyBurn = monthlyBurn + recurringCost;
    const cashAfterCost = currentCash - oneTimeCost;
    
    if (newMonthlyBurn <= 0) {
        return { score: 10, riskLevel: 'Muy Bajo', runwayMonths: Infinity, explanation: 'No tienes gastos recurrentes significativos.' };
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

    return { score, riskLevel, runwayMonths, explanation };
}