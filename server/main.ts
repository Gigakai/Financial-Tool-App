import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {calculateRisk, getSummary, calculateHealthReport, checkForFinancialAlerts, calculateProfitability} from "./logic.js";
import * as fs from 'node:fs';
// Creación del servidor MCP
const server = new McpServer({
    name: 'CFO-Virtual',
    version: '1.0.0',
});

// Herramienta principal: Risk-Grader
server.tool(
    'simulateFinancialScenario',
    'Calcula el riesgo de un escenario "What-If" (ej. una nueva compra o contratación). Devuelve un score de riesgo y un análisis. ¡USA ESTA HERRAMIENTA para cualquier pregunta sobre "puedo comprar", "puedo contratar", "qué pasa si gasto", o simulaciones de costos!', {
        empresa_id: z.string().describe('El ID único de la empresa. Ej: "E001"'),
        description: z.string().describe('Descripción del escenario que el usuario quiere simular. Ej: "Contratar un nuevo desarrollador" o "Comprar nueva maquinaria"'),
        recurringCost: z.number().optional().default(0).describe('El nuevo costo mensual recurrente de la simulación. Ej: 50000'),
        oneTimeCost: z.number().optional().default(0).describe('El costo único inicial de la simulación. Ej: 25000'),
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
    'Obtiene un resumen de transacciones (ingresos o gastos) para un periodo. ¡USA ESTA HERRAMIENTA para preguntas sobre "cuánto gasté", "en qué gasté más", "cuáles fueron mis ingresos", o "dame un resumen de marketing"!', {
        empresa_id: z.string().describe("El ID único de la empresa. Ej: 'E001'"),
        tipo: z.enum(['ingreso', 'gasto']).describe("El tipo de transacción a resumir, 'ingreso' o 'gasto'"),
        timePeriod: z.string().optional().default('current_month').describe("Rango relativo (ej: 'current_month', 'last_30_days', 'last_90_days'). Se ignora si se provee 'startDate' o 'endDate'."),
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
                        text: JSON.stringify({error: true, message: error.message}, null, 2)
                    }
                ]
            }
        }
    }
)
server.tool(
    'checkForFinancialAlerts',
    'Revisa proactivamente si hay alertas financieras, como sobregiro de presupuesto o riesgo de flujo de caja. Esta herramienta es para el sistema, no para preguntas directas del usuario.', {
        empresa_id: z.string().describe('El ID único de la empresa a revisar. Ej: "E001"'),
    },
    async (params) => {
        // 3. Llama a la función de lógica que creaste
        const alerts = await checkForFinancialAlerts(params.empresa_id);

        // 4. Devuelve el resultado
        if (alerts.length > 0) {
            // Si hay alertas, devuélvelas como un JSON para que el LLM las procese
            return {
                content: [{type: 'text', text: JSON.stringify(alerts, null, 2)}]
            };
        }

        // Si no hay alertas, devuelve un mensaje simple
        return {
            content: [{type: 'text', text: "No se encontraron alertas financieras."}]
        };
    }
)

server.tool(
    'getProfitabilityAnalysis',
    'Analiza la rentabilidad (Ingresos vs Gastos) por categoría para encontrar oportunidades de crecimiento. ¡USA ESTA HERRAMIENTA para preguntas como "¿qué área es más rentable?", "¿dónde debo invertir más?", "¿está funcionando marketing?", o "¿qué me da más dinero?"!', {
        empresa_id: z.string().describe("El ID único de la empresa. Ej: 'E001'"),
        timePeriod: z.string().optional().default('last_90_days').describe("Rango relativo (ej: 'current_month', 'last_30_days', 'last_90_days'). Se ignora si se provee 'startDate' o 'endDate'."),
        startDate: z.string().optional().describe("Fecha de inicio exacta del rango. Formato: 'MM/DD/YYYY'."),
        endDate: z.string().optional().describe("Fecha de fin exacta del rango. Formato: 'MM/DD/YYYY'."),
    },
    async (params) => {
        try {
            console.log(`[Server] Recibida consulta de Rentabilidad para ${params.empresa_id}`);

            // 1. Obtener el estado de la empresa para contexto
            const allStates = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
            const companyState = allStates[params.empresa_id];
            if (!companyState) {
                throw new Error(`No hay datos de estado para la empresa con id: ${params.empresa_id}`);
            }

            // 2. Llamar a la nueva lógica de rentabilidad
            const report = await calculateProfitability(
                params.empresa_id,
                params.timePeriod,
                params.startDate,
                params.endDate
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
                profitabilityReport: report // El array ordenado de categorías
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
            console.error(`[Server] Error en getProfitabilityAnalysis: ${error.message}`);
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

// Escuchar las conexiones entrantes
console.log("Servidor CFO Virtual listo. Esperando conexiones...");
(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})();
