import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import {LinearClient} from '../utils/linearClient.js';
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
        204: {},
    },
});

tasksRouter.openapi(createTaskRoute, async (c) => {
    const request = c.req.valid('json');

    let taskManagerClient: TaskManagerClient;
    if (request.authProvider === 'linear') {
        taskManagerClient = new LinearClient(request.authToken);
    } else {
        throw new Error(`Invalid authProvider: ${request.authProvider}`);
    }

    await taskManagerClient.createTask(request);
    return c.bdy(null, 204);
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
        204: {},
    },
});

tasksRouter.openapi(updateTaskRoute, async (c) => {
    const request = c.req.valid('json');

    let taskManagerClient: TaskManagerClient;
    if (request.authProvider === 'linear') {
        taskManagerClient = new LinearClient(request.authToken);
    } else {
        throw new Error(`Invalid authProvider: ${request.authProvider}`);
    }

    await taskManagerClient.updateTask(request);
    return c.bdy(null, 204);
});

export default tasksRouter;