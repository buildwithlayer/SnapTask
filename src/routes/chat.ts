import {createRoute, OpenAPIHono, z} from '@hono/zod-openapi';
import OpenAI from 'openai';
import {ChatCompletion, ChatCompletionChunk, ChatCompletionCreateParams} from 'openai/resources/chat/completions';
import {Stream} from 'openai/streaming';
import {chatRequestSchema, errorResponseSchema} from '../schemas/chat.js';

const chatRouter = new OpenAPIHono();

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const chatCompletionRoute = createRoute({
    description: 'Proxy OpenAI chat completion with exact same API',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: chatRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.any().openapi({
                        description: 'Non-streaming chat completion response',
                    }),
                },
                'text/event-stream': {
                    schema: z.string().openapi({
                        description: 'Server-sent events stream with OpenAI chat completion chunks',
                    }),
                },
            },
            description: 'Chat completion response (exact OpenAI format)',
        },
        500: {
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
    summary: 'Chat completion (OpenAI proxy)',
    tags: ['chat'],
});

chatRouter.openapi(chatCompletionRoute, async (c) => {
    try {
        const requestBody = c.req.valid('json') as ChatCompletionCreateParams;
        const completion = await openai.chat.completions.create(requestBody);

        if (requestBody.stream) {
            c.header('Content-Type', 'text/event-stream');
            c.header('Cache-Control', 'no-cache');
            c.header('Connection', 'keep-alive');

            const completionStream = completion as Stream<ChatCompletionChunk>;

            const stream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();

                    try {
                        for await (const chunk of completionStream) {
                            const data = `data: ${JSON.stringify(chunk)}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }

                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Content-Type': 'text/event-stream',
                },
            });
        }

        return c.json(completion as ChatCompletion);

    } catch (error) {
        console.error('OpenAI API Error:', error);

        return c.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            500,
        );
    }
});

export default chatRouter;