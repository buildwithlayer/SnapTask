import {OpenAPIHono} from '@hono/zod-openapi';

const amplitudeRouter = new OpenAPIHono();

amplitudeRouter.all('/*', async (c) => {
    try {
        const url = new URL(c.req.url);
        const path = url.pathname.replace('/api/amplitude', '') || '/2/httpapi';
        const targetUrl = `https://api2.amplitude.com${path}${url.search}`;
        
        const response = await fetch(targetUrl, {
            method: c.req.method,
            headers: Object.fromEntries(c.req.raw.headers.entries()),
            body: ['GET', 'HEAD'].includes(c.req.method) ? null : await c.req.arrayBuffer(),
        });
        
        // Return raw Response - this works with simple .all() routes
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        console.error('💥 Amplitude proxy error:', error);
        return c.json({error: 'Failed to proxy request'}, 500);
    }
});

export default amplitudeRouter;
