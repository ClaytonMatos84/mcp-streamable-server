import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function configureMcpServer(): McpServer {
    const server = new McpServer({
        name: 'mcp-streamable-server',
        version: '1.0.0',
    });

    server.tool(
        'invert-string',
        'Use essa tool para inverter uma palavra.',
        {
            word: z.string().describe('Palavra para ser invertida')
        },
        async ({ word }) => {
            const newWord = word.split('').reverse().join('');
            return {
                content: [{
                    type: 'text',
                    text: `A palavra: ${word} invertida fica assim: ${newWord}`
                }]
            }
        }
    );

    return server;
}
