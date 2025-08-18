import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import {LinearAuthRequestSchema, LinearAuthResponseSchema} from '../schemas/auth.js';

const authRouter = new OpenAPIHono();

const linearRoute = createRoute({
    description: 'Get Linear oauth token',
    method: 'post',
    path: '/linear',
    request: {
        body: {
            content: {
                'application/x-www-form-urlencoded': {
                    schema: LinearAuthRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: LinearAuthResponseSchema,
                },
            },
            description: 'The access token from Linear',
        },
    },
    tags: ['auth'],
});

authRouter.openapi(linearRoute, async (c) => {
    const request = c.req.valid('form');

    const response = await fetch('https://api.linear.app/oauth/token', {
        body: new URLSearchParams({
            client_id: import.meta.env.VITE_LINEAR_CLIENT_ID,
            client_secret: import.meta.env.VITE_LINEAR_CLIENT_SECRET,
            code: request.code,
            grant_type: request.grant_type,
            redirect_uri: import.meta.env.VITE_LINEAR_REDIRECT_URI,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencode',
        },
        method: 'POST',
    });

    if (response.ok) {
        return c.json(LinearAuthResponseSchema.parse(await response.json()));
    } else {
        console.error(response);
        return c.json({error: 'Failed to retrieve access token'}, 500);
    }
});

export default authRouter;