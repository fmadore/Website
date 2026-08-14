import { createServer } from 'node:http';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createWebsiteServer } from './server.js';

const port = Number.parseInt(process.env.PORT ?? '7860', 10);
const mcp = createMcpHandler(createWebsiteServer);
const handleMcp = toNodeHandler(mcp, {
	onerror(error) {
		console.error('MCP HTTP adapter error:', error);
	}
});

const allowedHosts = new Set(
	[
		'127.0.0.1',
		'localhost',
		'::1',
		process.env.SPACE_HOST,
		...(process.env.ALLOWED_HOSTS ?? '').split(',')
	]
		.map((host) => host?.trim().toLowerCase())
		.filter((host): host is string => Boolean(host))
);

function hostname(host = ''): string {
	if (host.startsWith('[')) return host.slice(1, host.indexOf(']'));
	return host.split(':')[0]?.toLowerCase() ?? '';
}

const http = createServer(async (request, response) => {
	const host = hostname(request.headers.host);
	if (!allowedHosts.has(host)) {
		response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Forbidden host.');
		return;
	}

	const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
	if (url.pathname === '/mcp') {
		await handleMcp(request, response);
		return;
	}

	if (url.pathname === '/' || url.pathname === '/healthz') {
		response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end(
			JSON.stringify({
				name: 'frederickmadore-website',
				status: 'ok',
				mcp: '/mcp',
				protocol: '2026-07-28'
			})
		);
		return;
	}

	response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found.');
});

http.listen(port, '0.0.0.0', () => {
	console.error(`MCP HTTP server listening on 0.0.0.0:${port}/mcp`);
});

async function close(): Promise<void> {
	await mcp.close();
	await new Promise<void>((resolve, reject) => {
		http.close((error) => (error ? reject(error) : resolve()));
	});
}

process.once('SIGINT', () => void close());
process.once('SIGTERM', () => void close());
