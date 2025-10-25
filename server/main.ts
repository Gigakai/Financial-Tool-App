import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Creación del servidor MCP
const server = new McpServer({
    name: 'MiServidorMCP',
    version: '1.0.0',
});

// Definir las herramientas disponibles en el servidor
server.tool(
    'sum',
    'Sum two numbers',
    {
        a: z.number().describe('El primer número a sumar'),
        b: z.number().describe('El segundo número a sumar'),
    },
    async (params) => {
        return {
            content: [
                {
                    type: 'text',
                    text: `La suma es: ${params.a + params.b}`
                },
            ]
        }
    }
)

// Escuchar las conexiones entrantes
const transport = new StdioServerTransport();
await server.connect(transport);