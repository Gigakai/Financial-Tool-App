import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {calculateRisk, getSummary, calculateHealthReport, checkForFinancialAlerts} from "./logic.js";
import fs from 'fs';
// Creación del servidor MCP
const server = new McpServer({
    name: 'CFO-Virtual',
    version: '1.0.0',
});

// Herramienta principal: Risk-Grader
server.tool(
    'simulateFinancialScenario',
    'Ejecuta una simulación "What-If" para una empresa específica y devuelve una calificación de riesgo en formato JSON.',
    {
        empresa_id: z.string().describe('El ID único de la empresa. Ej: "E001"'),
        description: z.string().describe('Descripción del escenario a simular. Ej: "Contratar un nuevo desarrollador"'),
        recurringCost: z.number().optional().default(0).describe('El nuevo costo mensual recurrente. Ej: 50000'),
        oneTimeCost: z.number().optional().default(0).describe('El costo único inicial. Ej: 25000 para equipo'),
    },
    async (params) => {
        try {
            console.log(`[Server] Recibida simulación para ${params.empresa_id}: ${params.description}`);

            // 1. Obtener el estado completo de la empresa para extraer la descripción
            const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
            const companyState = allStates[params.empresa_id];
            if (!companyState) {
                throw new Error(`No hay datos de estado para la empresa con id: ${params.empresa_id}`);
            }

            // 2. Llamar a la lógica de cálculo
            const riskResult = await calculateRisk(params.empresa_id, params.recurringCost, params.oneTimeCost);

            // 3. Crear el objeto de datos para el LLM, AÑADIENDO la descripción
            const resultForLlm = {
                simulationDescription: params.description,
                simulationCosts: {
                    recurringCost: params.recurringCost,
                    oneTimeCost: params.oneTimeCost
                },
                companyContext: { // Agrupar contexto de la empresa
                    name: companyState.companyName,
                    description: companyState.description, // <-- Aquí se añade
                    industry: companyState.industry,
                    riskProfile: companyState.riskProfile
                },
                riskAnalysis: {
                    score: riskResult.score,
                    riskLevel: riskResult.riskLevel,
                    runwayMonths: parseFloat(riskResult.runwayMonths.toFixed(1)),
                    contextualExplanation: riskResult.explanation,
                }
            };

            // 4. Devolver el objeto como un string JSON
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(resultForLlm, null, 2)
                    },
                ]
            }
        } catch (error: any) {
            console.error(`[Server] Error: ${error.message}`);
            // Devolver un error también en formato JSON es una buena práctica
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({error: true, message: error.message}, null, 2)
                    }
                ]
            }
        }
    }
)

// Herramienta de resumen financiero (Analista)
server.tool(
    'getFinancialSummary',
    'Obtiene un resumen financiero (ingresos o gastos) de un periodo específico para una empresa, filtrando por tipo, categoría y tiempo.',
    {
        empresa_id: z.string().describe("El ID único de la empresa. Ej: 'E001'"),
        tipo: z.enum(['ingreso', 'gasto']).describe("El tipo de transacción a resumir, 'ingreso' o 'gasto'"),
        timePeriod: z.string().optional().default('last_30_days').describe("Rango relativo (ej: 'current_month', 'last_30_days'). Se ignora si se provee 'startDate' o 'endDate'."),
        startDate: z.string().optional().describe("Fecha de inicio exacta del rango. Formato: 'MM/DD/YYYY'. Tiene prioridad sobre 'timePeriod'."),
        endDate: z.string().optional().describe("Fecha de fin exacta del rango. Formato: 'MM/DD/YYYY'. Tiene prioridad sobre 'timePeriod'."),
        categoria: z.string().optional().describe("Filtrar por una categoría específica. Ej: 'Marketing', 'Personal', 'Operaciones'"),
    },
    async (params) => {
        try {
            console.log(`[Server] Recibida consulta de resumen para ${params.empresa_id}`);

            // 1. Obtener el estado completo de la empresa (por si se necesita contexto adicional)
            const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
            const companyState = allStates[params.empresa_id];
            if (!companyState) {
                throw new Error(`No hay datos de estado para la empresa con id: ${params.empresa_id}`);
            }

            // 2. Llamar a la nueva lógica de resumen
            const summary = await getSummary(
                params.empresa_id, // 1. empresa_id
                params.tipo,       // 2. tipo
                params.timePeriod, // 3. timePeriod  <-- AHORA SE INCLUYE
                params.categoria,  // 4. categoria
                params.startDate,  // 5. startDate
                params.endDate     // 6. endDate
            );

            // 3. Crear el objeto de datos para el LLM
            const resultForLlm = {
                companyState: {
                    name: companyState.companyName,
                    industry: companyState.industry,
                    riskProfile: companyState.riskProfile,
                    description: companyState.description
                },
                queryParameters: params,
                summaryResult: summary // Esto contendrá { totalAmount, transactionCount, topTransactions }
            };

            // 4. Devolver el objeto como un string JSON
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(resultForLlm, null, 2)
                    },
                ]
            }
        } catch (error: any) {
            console.error(`[Server] Error en getFinancialSummary: ${error.message}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({error: true, message: error.message}, null, 2)
                    }
                ]
            }
        }
    }
)

server.tool(
    'getFinancialHealthCheck',
    'Realiza un análisis de salud financiera bajo demanda. Revisa el "runway" (reserva), el estado de los presupuestos y las tendencias de gastos para identificar riesgos y oportunidades inmediatas.',
    {
        empresa_id: z.string().describe("El ID único de la empresa. Ej: 'E001'"),
    },
    async (params) => {
        try {
            console.log(`[Server] Recibido HealthCheck para ${params.empresa_id}`);

            // 1. Llamar a la nueva lógica de análisis
            const healthReport = await calculateHealthReport(params.empresa_id);

            // 2. Devolver el JSON estructurado para el LLM
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(healthReport, null, 2)
                    },
                ]
            }
        } catch (error: any) {
            console.error(`[Server] Error en getFinancialHealthCheck: ${error.message}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: true, message: error.message }, null, 2)
                    }
                ]
            }
        }
    }
)
server.tool(
    'checkForFinancialAlerts',
    'Revisa los datos financieros en busca de riesgos proactivos, como exceder presupuestos.',
    {
        empresa_id: z.string().describe('El ID único de la empresa a revisar. Ej: "E001"'),
    },
    async (params) => {
        // 3. Llama a la función de lógica que creaste
        const alerts = await checkForFinancialAlerts(params.empresa_id);

        // 4. Devuelve el resultado
        if (alerts.length > 0) {
            // Si hay alertas, devuélvelas como un JSON para que el LLM las procese
            return {
                content: [{ type: 'text', text: JSON.stringify(alerts, null, 2) }]
            };
        }

        // Si no hay alertas, devuelve un mensaje simple
        return {
            content: [{ type: 'text', text: "No se encontraron alertas financieras." }]
        };
    }
)
// Escuchar las conexiones entrantes
console.log("Servidor CFO Virtual listo. Esperando conexiones...");
const transport = new StdioServerTransport();
await server.connect(transport);