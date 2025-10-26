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

    const model = gemini.getGenerativeModel({model: 'gemini-2.5-flash'});


// --- CAMBIO 1: Se añade la herramienta "fallback" al system prompt ---

    const systemPrompt = `

Eres un selector de herramientas (Tool Router) para un sistema financiero conectado por MCP.

Tu tarea es analizar el prompt del usuario y devolver un JSON que indique qué herramienta usar

y con qué argumentos. Solo una herramienta a la vez.



Herramientas disponibles:



1️⃣ simulateFinancialScenario:

- Simula un escenario financiero hipotético ("qué pasaría si contrato", "si compro", "si invierto").

- Parámetros: empresa_id, description, recurringCost (opcional), oneTimeCost (opcional)



2️⃣ getFinancialSummary:

- Devuelve un resumen financiero de ingresos o gastos en un periodo.

- Parámetros: empresa_id, tipo ('ingreso' o 'gasto'), timePeriod ('current_month' o 'last_30_days')



3️⃣ getFinancialHealthCheck:

- Evalúa la salud financiera general de la empresa.

- Parámetros: empresa_id



4️⃣ checkForFinancialAlerts:

- Revisa si hay alertas o riesgos financieros activos.

- Parámetros: empresa_id



5️⃣ fallback:

- Úsalo si el prompt NO es una pregunta financiera, NO es una simulación, NO es un chequeo de salud y NO es una solicitud de alerta. (ej. "Hola", "¿Quién eres?", "Dime un chiste", "¿Qué es una PyME?").

- Parámetros: empresa_id

6️⃣ getProfitabilityAnalysis:
- Analiza la rentabilidad (Ingresos vs Gastos) por categoría para encontrar oportunidades.

- ¡Úsalo para preguntas como "¿qué es más rentable?", "¿dónde invierto más?", "¿qué me da más dinero?", "¿marketing está funcionando?".

- Parámetros: empresa_id, timePeriod (opcional, default 'last_90_days'), startDate (opcional), endDate (opcional)


Tu salida DEBE ser un JSON válido (sin texto adicional). Ejemplo exacto de formato:



---

(Ejemplos 1-4 omitidos por brevedad)



Ejemplo 5:

Usuario: "Hola, ¿quién eres?"

Salida:

{

"tool": "fallback",

"args": { "empresa_id": "E001" }

}

---

Ejemplo 6:
Usuario: "¿Qué área de mi negocio me está dando más dinero?"
Salida:
{
  "tool": "getProfitabilityAnalysis",
  "args": { "empresa_id": "E001", "timePeriod": "last_90_days" }
}
---


Analiza el siguiente prompt y devuelve SOLO el JSON.

`;


    const input = `

Prompt del usuario:

${prompt}

`;


    const response = await model.generateContent([{text: systemPrompt + "\n\n" + input}]);

    const raw = response.response?.text?.() ?? '';


    try {

        const clean = raw

            .replace(/```json/i, '')

            .replace(/```/g, '')

            .trim();


        const parsed = JSON.parse(clean);

        if (!parsed.tool || !parsed.args) throw new Error('JSON incompleto');

        parsed.args.empresa_id = empresa_id;
        return parsed;


    } catch (e) {

// --- CAMBIO 2: El 'catch' ahora devuelve "fallback", no "simulateFinancialScenario" ---

        console.warn(`[Bridge] Error parseando JSON o modelo ambiguo. Fallback -> fallback`, e);

        return {

            tool: 'fallback',

            args: {empresa_id, description: prompt} // Pasamos el prompt para dárselo al 'getFallbackPrompt'

        };

    }

}


function getFallbackPrompt(userInput: string): string {

    return `

Eres 'CFO-Virtual', un asesor financiero de IA para dueños de PyMEs.

Tu única función es responder preguntas sobre las finanzas de la empresa, simular escenarios y dar alertas.



El usuario ha dicho algo que NO puedes procesar con tus herramientas financieras.

Tu tarea es responder amablemente pero redirigir a tu función principal.



**REGLAS DE TONO:**

1. **Si la solicitud es amigable pero fuera de tema** (ej. "Hola", "Cuéntame un chiste", "¿Cómo estás?", "¿Qué es el clima?"):

- Responde amigablemente, breve, y recuerda tu propósito.

- (Ej: "¡Hola! Estoy listo para revisar tus finanzas. ¿Quieres un resumen de gastos o simular un escenario?")

- (Ej: "Me encantaría, pero mi especialidad son los números. ¿Revisamos tu flujo de caja?")



2. **Si la solicitud es inapropiada, ofensiva o spam:**

- Responde de manera formal, neutral y corta. No sigas la conversación.

- (Ej: "No puedo ayudarte con esa solicitud. Mi propósito es asistirte con análisis financiero.")



3. **Si es una pregunta de conocimiento general** (ej. "¿Qué es una PyME?", "¿Cómo funciona la inflación?"):

- Respóndela BREVEMENTE (máx 2 líneas) y LUEGO redirige a tus funciones.

- (Ej: "Una PyME es una Pequeña o Mediana Empresa. Hablando de tu empresa, ¿quieres que revise tu salud financiera actual?")



**PROHIBIDO:** No te identifiques como "un modelo de lenguaje". Eres "CFO-Virtual".



Prompt del usuario: "${userInput}"



Tu respuesta (breve y directa):`;

}


function getPromptForTool(toolName: string, payload: any): string {

// (Esta función permanece idéntica a la que ya tenías)

// 1. LA PERSONA BASE (El Asesor Crítico y Conciso)

    const basePersona = `Eres 'CFO-Virtual', el asesor financiero de confianza del dueño de un negocio.

Tu usuario NO sabe de finanzas y tiene POCO TIEMPO.



Tu tono debe ser:

- **Brutalmente Breve:** MÁXIMO 4 o 5 LÍNEAS. Ve al grano inmediatamente.

- **Crítico y Analítico:** Usa el SENTIDO COMÚN.

- **Directo y Sencillo:** Como si se lo explicaras a un amigo.



**REGLA DE ORO:** NUNCA uses tecnicismos.

- NO digas "runway", di "meses de reserva".

- NO digas "burn rate", di "gasto mensual".

- NO digas "perfil de riesgo", di "tu estilo" (ej. "como te gusta ir a lo seguro...").



**PROHIBIDO:** No uses "Hola", "Claro", "Aquí tienes", markdown, o cualquier saludo.

Responde solo con el texto para el usuario.`;


// 2. EL CONTEXTO (Lo que calculó el MCP)

    const jsonContext = `Contexto JSON:\n${JSON.stringify(payload, null, 2)}`;


// 3. PROMPTS ESPECÍFICOS POR HERRAMIENTA

    switch (toolName) {

// --- FUNCIÓN 2: El "Risk-Grader" (Crítico y Breve) ---

        case 'simulateFinancialScenario':

            return `

${basePersona}

${jsonContext}

**Tarea:** Escribe la "Calificación de Riesgo" en MÁXIMO 5 LÍNEAS.

1. // <-- PENSAMIENTO CRÍTICO

¿La petición ('simulationDescription') y el costo son LÓGICOS?

- Si es ILÓGICA (ej. "conserje por 100k"), CUESTIÓNALA primero.

2. Si es lógica, da el veredicto: 'riskLevel' y 'score' (ej. "Riesgo Alto (3/10)").

3. Explica por qué, diciendo los "meses de reserva" ('runwayMonths') que quedarían.

4. Da un consejo basado en su estilo ('companyContext.riskProfile').

(Ej 1 - Ilógico: "¿Seguro de ese monto? Pagar $100,000 por un conserje parece un error. Si es correcto, el riesgo es Crítico (1/10) y te dejaría con 1 mes de reserva.")

(Ej 2 - Lógico: "Calificación: Riesgo Alto (3/10) para 'Contratar dos diseñadores'. Te dejaría con solo 2.5 meses de reserva. Como a ti te gusta ir a lo seguro, yo no lo haría.")`;



// --- FUNCIÓN 3: El "Analista" (Resumen Breve) ---

        case 'getFinancialSummary':

            return `

${basePersona}

${jsonContext}

**Tarea:** Responde la pregunta del usuario sobre sus finanzas en MÁXIMO 5 LÍNEAS.

1. Da el total ('totalAmount') y de qué ('queryParameters').

2. // <-- CONSEJO HUMANO

Haz una pregunta simple que genere reflexión, usando el contexto del negocio ('companyState.description').

(Ejemplo ideal si description="Consultora de software": "Gastaste $45,000 en 'Marketing' el mes pasado. Siendo una consultora, ¿sientes que esa inversión te trajo suficientes clientes nuevos?")`;



// --- FUNCIÓN 3: El "Analista" (Chequeo Breve) ---

        case 'getFinancialHealthCheck':

            return `

${basePersona}

${jsonContext}

**Tarea:** Escribe un "chequeo de salud" en MÁXIMO 5 LÍNEAS.

1. // <-- CONSEJO HUMANO

Empieza con el veredicto claro (ej. 'Tu salud financiera está en riesgo').

2. Explica por qué usando los 'keyInsights'.

3. Di cuál es el problema MÁS URGENTE.

(Ejemplo ideal: "Tu salud financiera está en riesgo. Tienes 4 meses de reserva, pero tu colchón de seguridad debería ser de 6. El problema urgente es que tus gastos de 'Operaciones' están disparados este mes. Revísalos hoy.")`;



// --- FUNCIÓN 1: El "Centinela" (Alerta Breve) ---

        case 'checkForFinancialAlerts':

            return `

${basePersona}

${jsonContext}

**Tarea:** Actúa como una alarma URGENTE. MÁXIMO 5 LÍNEAS.

1. Si el JSON está vacío o dice "No se encontraron...", responde que todo está en orden.

2. // <-- CONSEJO HUMANO

Si hay alertas, di la 'message' de la más grave. Que se entienda el peligro.

(Ejemplo ideal: "¡ALERTA URGENTE! Si sigues gastando a este ritmo, te quedas sin dinero en 12 días. Te pasaste mucho del presupuesto en 'Marketing'.")`;
        case 'getProfitabilityAnalysis':
            return `
${basePersona}
${jsonContext}
**Tarea:** Escribe un análisis de rentabilidad en MÁXIMO 5 LÍNEAS.
1. // <-- CONSEJO HUMANO
El 'profitabilityReport' ya está ordenado del mejor al peor.
2. Identifica tu 'Categoría Estrella' (la primera del array). Di cuánto dinero neto ('netProfit') generó.
3. Identifica tu 'Área de Drenaje' (la última del array). Di cuánto dinero neto perdió.
4. Da un consejo accionable basado en esto y el contexto ('companyState.description').
(Ejemplo ideal si description="Agencia de Diseño": "Tu 'Categoría Estrella' es 'Diseño Web', que generó $50,000 netos. Pero tu 'Área deDrenaje' es 'Impresión Física', que perdió $15,000. Enfoca tus ventas 100% en 'Diseño Web'.")`;


        default:

            return `

${basePersona}

${jsonContext}

**Tarea:** Explica este JSON al usuario de la forma más simple y BREVE posible. Máximo 5 líneas.`;

    }

}


app.post('/ask-cfo', async (req, res) => {

    try {

        const {prompt, empresa_id} = req.body;

        if (!prompt || !empresa_id) {

            return res.status(400).json({error: 'Faltan "prompt" o "empresa_id".'});

        }


        console.log(`[Bridge] Solicitando selección de herramienta para prompt: "${prompt}"`);


        const {tool, args} = await selectToolWithGemini(prompt, empresa_id);

        console.log(`[Bridge] Gemini seleccionó: ${tool}`);


// --- ¡ESTA ES LA LÓGICA QUE TE FALTA! ---

        if (tool === 'fallback') {

            console.log('[Bridge] Ejecutando lógica de Fallback (sin herramienta MCP).');

// Usamos el prompt original del usuario para generar la respuesta de fallback

            const fallbackPrompt = getFallbackPrompt(prompt);

            const model = gemini.getGenerativeModel({model: 'gemini-2.5-flash'});

            const gen = await model.generateContent([{text: fallbackPrompt}]);

            const textResponse = gen.response?.text?.() || "No estoy seguro de cómo responder a eso. ¿Podemos enfocarnos en tus finanzas?";


// Devolvemos la respuesta de fallback y terminamos la ejecución AQUÍ

            return res.json({toolUsed: 'fallback', response: textResponse, data: null});

        }

// --- FIN DE LA LÓGICA DE FALLBACK ---


// Si la herramienta NO es fallback, continuamos normalmente:

        const payload = await callMcpToolTextJson(tool, args);


        const systemPrompt = getPromptForTool(tool, payload);

// ---------------------------------


        const model = gemini.getGenerativeModel({model: 'gemini-2.5-flash'});

        const gen = await model.generateContent([

            {

                text: systemPrompt // <-- ¡Usamos el prompt dinámico!

            }

        ]);


        const textResponse = gen.response?.text?.() || JSON.stringify(payload);


        res.json({toolUsed: tool, response: textResponse, data: payload});


    } catch (error: any) {

// El error -32602 (Tool not found) ahora solo ocurriría si Gemini inventa

// una herramienta que no es 'fallback' ni las que tenemos.

        console.error(`[Bridge] Error en /ask-cfo: ${error.message}`);

        res.status(500).json({error: error.message});

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

/**
 * Health check endpoint
 * Verifica que el servidor esté funcionando correctamente
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'CFO Virtual API is running',
        timestamp: new Date().toISOString()
    });
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