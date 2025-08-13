import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import {LinearClient} from '../utils/linearClient.js';
import {MockClient} from '../utils/mockClient.js';
import {CreateTaskRequest, TaskManagerClient, UpdateTaskRequest} from '../utils/taskManagerClient.js';

const tasksRouter = new OpenAPIHono();

const createTaskRoute = createRoute({
    description: 'Create a new task',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateTaskRequest,
                },
            },
        },
    },
    responses: {
        204: {
            description: 'No content',
        },
    },
});

tasksRouter.openapi(createTaskRoute, async (c) => {
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

    await taskManagerClient.createTask(request);
    return c.body(null, 204);
});

const updateTaskRoute = createRoute({
    description: 'Update an existing task',
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateTaskRequest,
                },
            },
        },
    },
    responses: {
        204: {
            description: 'No content',
        },
    },
});

tasksRouter.openapi(updateTaskRoute, async (c) => {
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

    await taskManagerClient.updateTask(request);
    return c.body(null, 204);
});

export default tasksRouter;