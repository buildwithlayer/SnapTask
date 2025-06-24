import {createRoute, OpenAPIHono, z} from '@hono/zod-openapi';
import { extractSummary } from '../utils/extract.js';

const extractRouter = new OpenAPIHono();

const summarizeRoute = createRoute({
    description: 'Extract a summary from a transcript',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        transcript: z.string(),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        summary: z.string(),
                    }),
                },
            },
            description: 'Summary of the transcript',
        },
    },
});

extractRouter.openapi(summarizeRoute, async (c) => {
    const {transcript} = await c.req.json();
    const summary = await extractSummary(transcript);
    return c.json({summary});
});

export default extractRouter;




