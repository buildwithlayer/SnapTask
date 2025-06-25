import {createRoute, OpenAPIHono, z} from '@hono/zod-openapi';
import {AssemblyAI} from 'assemblyai';
import { File } from 'buffer';

const transcribeRouter = new OpenAPIHono();

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || 'NO API KEY PROVIDED',
});

const transcribeFileRoute = createRoute({
    description: 'Transcribe an audio file',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        file: z.instanceof(File).openapi({
                            description: 'Audio file to transcribe',
                            format: 'binary',
                            type: 'string',
                        }),
                        language: z.string().default('en_us').openapi({
                            description:
                                'Optional language code for transcription (e.g., "en_us").',
                        }),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.string(),
                },
            },
            description: 'Text transcription result from AssemblyAI',
        },
    },
    summary: 'Transcribe an audio file',
    tags: ['transcribe'],
});

transcribeRouter.openapi(transcribeFileRoute, async (c) => {
    const {file, language} = c.req.valid('form');

    const transcript = await client.transcripts.transcribe({
        audio: await file.arrayBuffer(),
        language_code: language || 'en_us',
    });
    
    return c.json(transcript.text);
});

export default transcribeRouter;