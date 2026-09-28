import { createServer } from 'node:http';
import { toNodeHandler, hostHeaderValidation, originValidation } from '@modelcontextprotocol/node';
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

const bindHost = process.env.MCP_BIND_HOST ?? (process.env.SPACE_HOST ? '0.0.0.0' : '127.0.0.1');
const localHosts = ['127.0.0.1', 'localhost', '[::1]'];
const configuredHosts = (value = '') =>
	value
		.split(',')
		.map((host) => host.trim().toLowerCase())
		.filter(Boolean);
const spaceHosts = configuredHosts(process.env.SPACE_HOST);
const validateHost = hostHeaderValidation([
	...localHosts,
	...spaceHosts,
	...configuredHosts(process.env.ALLOWED_HOSTS)
]);
// Native clients omit Origin. Browser origins need an explicitly trusted hostname.
const validateOrigin = originValidation([
	...localHosts,
	...spaceHosts,
	...configuredHosts(process.env.ALLOWED_ORIGIN_HOSTS)
]);

const http = createServer(async (request, response) => {
	if (!validateHost(request, response)) return;
	// SDK validation owns the hostname policy; also require a serialized HTTP(S)
	// origin, rather than accepting URL paths, credentials, or an empty header.
	if (request.headers.origin !== undefined) {
		try {
			const origin = new URL(request.headers.origin);
			if (
				!['http:', 'https:'].includes(origin.protocol) ||
				origin.origin !== request.headers.origin
			)
				throw new Error('Invalid origin');
		} catch {
			response
				.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
				.end('Forbidden origin.');
			return;
		}
	}
	if (!validateOrigin(request, response)) return;

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

http.listen(port, bindHost, () => {
	const address = http.address();
	console.error(
		`MCP HTTP server listening on ${bindHost}:${typeof address === 'object' && address ? address.port : port}/mcp`
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
