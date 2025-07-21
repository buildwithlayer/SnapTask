import {createRoute, OpenAPIHono, z} from '@hono/zod-openapi';

const amplitudeRouter = new OpenAPIHono();

const amplitudeProxyRoute = createRoute({
    description: 'Proxy all requests to Amplitude API',
    method: 'post', // OpenAPI requires a specific method, but we'll handle all methods
    path: '/*',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.any().openapi({
                        description: 'Any payload to forward to Amplitude API',
                    }),
                },
                'text/plain': {
                    schema: z.string().openapi({
                        description: 'Text payload to forward to Amplitude API',
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.any().openapi({
                        description: 'Response from Amplitude API',
                    }),
                },
                'text/plain': {
                    schema: z.string().openapi({
                        description: 'Text response from Amplitude API',
                    }),
                },
            },
            description: 'Successful response from Amplitude API',
        },
        500: {
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: 'Proxy error',
        },
    },
    summary: 'Amplitude API Proxy',
    tags: ['amplitude'],
});

// OpenAPI documented route mainly for Swagger UI
amplitudeRouter.openapi(amplitudeProxyRoute, async (c) => {
    return handleAmplitudeProxy(c);
});

// Catch-all route for all HTTP methods (handles the actual proxying)
amplitudeRouter.all('/*', async (c) => {
    return handleAmplitudeProxy(c);
});

// Shared proxy handler function
async function handleAmplitudeProxy(c: any) {
    try {
        const url = new URL(c.req.url);
        const path = url.pathname.replace('/amplitude', '');
        const amplitudeUrl = `https://api2.amplitude.com${path}${url.search}`;
        
        // Get the request body
        let body: string | undefined;
        if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
            body = await c.req.text();
        }
        
        // Forward the request to Amplitude
        const response = await fetch(amplitudeUrl, {
            method: c.req.method,
            headers: {
                'Content-Type': c.req.header('Content-Type') || 'application/json',
                'Authorization': c.req.header('Authorization') || '',
                'User-Agent': c.req.header('User-Agent') || 'SnapLinear-Proxy/1.0',
            },
            body: body,
        });
        
        // Get response content
        const responseText = await response.text();
        
        // Return the response with the same status and content type
        const contentType = response.headers.get('Content-Type') || 'application/json';
        
        return c.text(responseText, response.status, {
            'Content-Type': contentType,
        });
        
    } catch (error) {
        console.error('Amplitude proxy error:', error);
        return c.json({ error: 'Failed to proxy request to Amplitude' }, 500);
    }
}

export default amplitudeRouter;
