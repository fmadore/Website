import { createServer } from 'node:http';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createWebsiteServer } from './server.js';

const port = Number(process.env.PORT ?? '7860');
if (!Number.isInteger(port) || port < 0 || port > 65535)
	throw new Error('PORT must be an integer from 0 to 65535');
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

	let url: URL;
	try {
		url = new URL(request.url ?? '/', `http://${request.headers.host}`);
	} catch {
		response.writeHead(400).end('Bad request.');
		return;
	}
	if (url.pathname === '/mcp') {
		try {
			await handleMcp(request, response);
		} catch (error) {
			console.error('MCP request failed:', error);
			if (!response.headersSent) response.writeHead(500).end('Request failed.');
			else response.destroy();
		}
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
	const address = http.address();
	console.error(
		`MCP HTTP server listening on 0.0.0.0:${typeof address === 'object' && address ? address.port : port}/mcp`
	);
});

async function close(): Promise<void> {
	await mcp.close();
	await new Promise<void>((resolve, reject) => {
		http.close((error) => (error ? reject(error) : resolve()));
	});
}

let closing = false;
function shutdown() {
	if (closing) return;
	closing = true;
	void close()
		.catch((error) => {
			console.error(error);
			process.exitCode = 1;
		})
		.finally(() => {
			process.disconnect?.();
		});
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
// Parent supervisors can request a graceful stop over a private IPC channel.
if (process.send)
	process.on('message', (message) => {
		if (message === 'shutdown') shutdown();
	});
