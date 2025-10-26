import express from 'express';

import cors from 'cors';

import {Client as McpClient} from '@modelcontextprotocol/sdk/client/index.js';

import {StdioClientTransport as ChildProcessTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

import {GoogleGenerativeAI} from '@google/generative-ai';

import 'dotenv/config'; // Asegúrate de tener .env con GEMINI_API_KEY


// --- 1. Configuración del Cliente Gemini ---

// El cliente usará las herramientas que el servidor MCP le exponga

if (!process.env.GEMINI_API_KEY) {

    throw new Error("Falta la variable de entorno GEMINI_API_KEY");

}

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// --- 2. Configuración del Servidor Express ---

const app = express();

const port = process.env.PORT || 3000; // El frontend hablará con este puerto

app.use(express.json());

app.use(cors()); // Permitir todas las conexiones (perfecto para hackathon)


// --- 3. Conexión al Servidor MCP ---

// Usaremos el transportador `StdioClientTransport` del SDK para spawnear el proceso internamente.

console.log('[Bridge] Preparando transporte stdio para el servidor MCP...');

const transport = new ChildProcessTransport({

    command: 'node',

// Node 20+ requiere --import tsx en lugar de --loader tsx

    args: ['--import', 'tsx', 'main.ts'],

    cwd: process.cwd(),

    stderr: 'inherit'

});


// Creamos el cliente MCP (alias McpClient) con información básica

const client = new McpClient({name: 'bridge', version: '1.0.0'});


// Helpers para invocar herramientas del MCP y parsear respuestas tipo text JSON

async function callMcpToolTextJson(name: string, args: Record<string, unknown>): Promise<any> {

    const result = await client.callTool({name, arguments: args});

// El servidor devuelve content: [{type:'text', text: '...json...'}]

    const part = (result as any)?.content?.[0];

    if (part && part.type === 'text' && typeof part.text === 'string') {

        try {

            return JSON.parse(part.text);

        } catch {

            return part.text;

        }

    }

    return result;

}


// --- 4. Definición de Endpoints de la API ---


/**

 * Endpoint principal para el "Analista" y el "Risk-Grader".

 * El frontend solo envía un prompt de usuario.

 * Gemini decide qué herramienta MCP llamar (simulateFinancialScenario o getFinancialSummary).

 */

async function selectToolWithGemini(prompt: string, empresa_id: string) {
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
Eres un enrutador de herramientas (Tool Router) para un sistema financiero MCP.
Tienes acceso a las siguientes herramientas y debes elegir solo UNA según el prompt del usuario.

1️⃣ simulateFinancialScenario:
- Simula un escenario financiero "What If" (por ejemplo, contratar, invertir, comprar equipo).
- Parámetros: empresa_id, description, recurringCost (opcional), oneTimeCost (opcional)

2️⃣ getFinancialSummary:
- Devuelve un resumen financiero de ingresos o gastos en un periodo.
- Parámetros: empresa_id, tipo ('ingreso' o 'gasto'), timePeriod ('current_month' o 'last_30_days')

3️⃣ getFinancialHealthCheck:
- Hace un chequeo general de salud financiera.

4️⃣ checkForFinancialAlerts:
- Revisa alertas y riesgos financieros actuales.

Tu salida debe ser un JSON con esta forma estricta:
{
  "tool": "simulateFinancialScenario" | "getFinancialSummary" | "getFinancialHealthCheck" | "checkForFinancialAlerts",
  "args": { ...parámetros necesarios... }
}

No des explicaciones. No devuelvas texto adicional. Solo JSON válido.

Ejemplo:
{
  "tool": "getFinancialSummary",
  "args": { "empresa_id": "E001", "tipo": "gasto", "timePeriod": "last_30_days" }
}
`;

    // ✅ Cambio aquí: sin "role"
    const response = await model.generateContent([
        { text: systemPrompt + "\n\nPrompt del usuario:\n" + prompt }
    ]);

    const raw = response.response?.text?.() ?? '';
    try {
        const parsed = JSON.parse(raw);
        if (!parsed.tool || !parsed.args) throw new Error('JSON incompleto');
        if (!parsed.args.empresa_id) parsed.args.empresa_id = empresa_id;
        return parsed;
    } catch {
        console.warn('[Bridge] No se pudo parsear JSON de Gemini, usando fallback.');
        return {
            tool: 'simulateFinancialScenario',
            args: { empresa_id, description: prompt }
        };
    }
}


app.post('/ask-cfo', async (req, res) => {
    try {
        const { prompt, empresa_id } = req.body;
        if (!prompt || !empresa_id) {
            return res.status(400).json({ error: 'Faltan "prompt" o "empresa_id".' });
        }

        console.log(`[Bridge] Solicitando selección de herramienta para prompt: "${prompt}"`);

        const { tool, args } = await selectToolWithGemini(prompt, empresa_id);
        console.log(`[Bridge] Gemini seleccionó: ${tool}`);

        const payload = await callMcpToolTextJson(tool, args);

        const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const gen = await model.generateContent([
            {
                text: `Contexto JSON:\n${JSON.stringify(payload)}\n\nRedacta una respuesta breve y clara para el usuario.`
            }
        ]);

        const textResponse = gen.response?.text?.() || JSON.stringify(payload);

        res.json({ toolUsed: tool, response: textResponse, data: payload });

    } catch (error: any) {
        console.error(`[Bridge] Error en /ask-cfo: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});


/**

 * Endpoint para el "Centinela" (Proactivo).

 * El frontend llamará a este endpoint cada 30 segundos.

 * Llama directamente a la herramienta MCP sin pasar por Gemini.

 */

app.get('/check-alerts/:empresa_id', async (req, res) => {

    try {

        const {empresa_id} = req.params as { empresa_id: string };

        const result = await callMcpToolTextJson('checkForFinancialAlerts', {empresa_id});


        const alerts = Array.isArray(result) ? result : [];

        console.log(`[Bridge] Alertas encontradas para ${empresa_id}: ${alerts.length}`);

        res.json({alerts});


    } catch (error: any) {

        console.error(`[Bridge] Error en /check-alerts: ${error.message}`);

        res.status(500).json({error: error.message});

    }

});


// --- 5. Iniciar todo ---

(async () => {

    try {

// Conectamos el cliente al transport (esto inicia el proceso hijo internamente)

        await client.connect(transport);

        console.log('[Bridge] Cliente MCP conectado al servidor hijo.');


// Ahora que el cliente está listo, iniciamos el servidor Express

        app.listen(port, () => {

            console.log(`[Bridge] Servidor API (puente) escuchando en http://localhost:${port}`);

            console.log('--- ¡Sistema listo! ---');

        });


    } catch (err: any) {

        console.error('[Bridge] Error fatal al iniciar:', err.message);

        try {

// Intentamos cerrar el transport si está abierto

            if (transport && (transport as any).close) {

                await (transport as any).close();

            }

        } catch (closeErr) {

// Ignorar

        }

        process.exit(1);

    }

})();