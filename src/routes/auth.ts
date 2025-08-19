import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import {AsanaAuthRequestSchema, AsanaAuthResponseSchema, LinearAuthRequestSchema, LinearAuthResponseSchema} from '../schemas/auth.js';

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
            'Content-Type': 'application/x-www-form-urlencoded',
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

const asanaRoute = createRoute({
    description: 'Get Asana oauth token',
    method: 'post',
    path: '/asana',
    request: {
        body: {
            content: {
                'application/x-www-form-urlencoded': {
                    schema: AsanaAuthRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: AsanaAuthResponseSchema,
                },
            },
            description: 'The access token from Asana',
        },
    },
    tags: ['auth'],
});

authRouter.openapi(asanaRoute, async (c) => {
    const request = c.req.valid('form');

    const response = await fetch('https://app.asana.com/-/oauth_token', {
        body: new URLSearchParams({
            client_id: import.meta.env.VITE_ASANA_CLIENT_ID,
            client_secret: import.meta.env.VITE_ASANA_CLIENT_SECRET,
            code: request.code,
            grant_type: request.grant_type,
            redirect_uri: import.meta.env.VITE_ASANA_REDIRECT_URI,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
    });

    if (response.ok) {
        return c.json(AsanaAuthResponseSchema.parse(await response.json()));
    } else {
        console.error(response);
        return c.json({error: 'Failed to retrieve access token'}, 500);
    }
});

export default authRouter;