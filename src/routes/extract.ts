import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import {LinearClient} from '../utils/linearClient.js';
import {MockClient} from '../utils/mockClient.js';
import {ProcessTranscriptRequest, ProcessTranscriptResponse, TaskManagerClient} from '../utils/taskManagerClient.js';

const extractRouter = new OpenAPIHono();

const summarizeRoute = createRoute({
    description: 'Extract new tasks and updates from a transcript',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: ProcessTranscriptRequest,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ProcessTranscriptResponse,
                },
            },
            description: 'New tasks and updates from the transcript',
        },
    },
    tags: ['extract'],
});

extractRouter.openapi(summarizeRoute, async (c) => {
    const request = c.req.valid('json');

    let taskManagerClient: TaskManagerClient;
    switch (request.authProvider) {
    case 'linear':
        taskManagerClient = new LinearClient(request.authToken);
        break;
    case 'mock':
        taskManagerClient = new MockClient(request.authToken);
        break;
    default:
        throw new Error(`Invalid authProvider: ${request.authProvider}`);
    }

    const response = await taskManagerClient.processTranscript(request);
    return c.json(response);
});

export default extractRouter;
