import 'dotenv/config';
import {serveStatic} from '@hono/node-server/serve-static';
import {swaggerUI} from '@hono/swagger-ui';
import {OpenAPIHono} from '@hono/zod-openapi';
import {cors} from 'hono/cors';
import amplitudeRouter from './routes/amplitude.js';
import extractRouter from './routes/extract.js';
import tasksRouter from './routes/tasks.js';
import transcribeRouter from './routes/transcribe.js';

const app = new OpenAPIHono();

app.use('*', cors());

// API routes
app.route('/api/amplitude', amplitudeRouter);
app.route('/api/extract', extractRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/transcribe', transcribeRouter);

// API documentation
app.doc('/api/doc', {
    info: {
        title: 'MCP Web Client API',
        version: '1.0.0',
    },
    openapi: '3.0.0',
    servers: [
        {
            description: 'Development server',
            url: 'http://localhost:3001',
        },
    ],
});

app.get('/api/ui', swaggerUI({url: '/api/doc'}));

// Serve static React files from dist directory
app.use('/*', serveStatic({
    index: 'index.html',
    root: './dist',
}));

// Fallback for React Router (SPA) - serves index.html for any unmatched routes
app.get('*', serveStatic({
    path: './dist/index.html',
}));

export default app;