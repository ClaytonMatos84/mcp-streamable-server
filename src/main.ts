import express, { Request, Response } from 'express';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = new McpServer({
    name: 'mcp-streamable-server',
    version: '1.0.0'
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

const app = express();

const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
})

const setupServer = async () => {
    await server.connect(transport);
};

app.post('/mcp', async (req: Request, res: Response) => {
    console.log('Received MCP request:', req.body);
    try {
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null,
            });
        }
    }
});

app.get('/mcp', async (req: Request, res: Response) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    }));
});

const PORT = process.env.PORT || 3000;
setupServer().then(() => {
    app.listen(PORT, () => {
        console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to set up the server:', error);
    process.exit(1);
});
