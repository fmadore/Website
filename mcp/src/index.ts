import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createWebsiteServer } from './server.js';

void serveStdio(createWebsiteServer);
