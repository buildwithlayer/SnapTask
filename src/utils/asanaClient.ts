import OpenAI from 'openai';
import {z} from 'zod';
import {
    Configuration, CreateTaskOperationRequest, ProjectsApi,
    type TaskRequest, TaskResponse,
    TasksApi,
    TeamsApi,
    UpdateTaskRequest as AsanaUpdateTaskRequest, UsersApi,
} from '../generated/asana/index.js';
import {CreateSnapTask, SnapTask, UpdateSnapTask} from '../schemas/snapTask.js';
import {
    createNewTask,
    existingTasksContext,
    noExistingTasks,
    noExistingTasksContext,
    updateExistingTasks,
} from './linearClient.prompts.js';
import {
    CreateTaskRequest,
    ProcessTranscriptRequest, ProcessTranscriptResponse,
    TaskManagerClient,
    UpdateTaskRequest, UpdateWithOriginal,
} from './taskManagerClient.js';

const Project = z.object({
    id: z.string(),
    name: z.string(),
});

const User = z.object({
    id: z.string(),
    name: z.string(),
});

const Context = z.object({
    projects: z.array(Project),
    teamId: z.string(),
    transcript: z.string(),
    users: z.array(User),
    workspaceId: z.string(),
});

type Context = z.infer<typeof Context>;

const CreateTaskResponse = z.object({
    conclusion: z.string(),
    reasoning: z.string(),
    task: CreateSnapTask.nullish().optional(),
});

const UpdateTasksResponse = z.array(z.object({
    conclusion: z.string(),
    id: z.string(),
    reasoning: z.string(),
    updated_task: UpdateSnapTask.omit({id: true}).nullish().optional(),
}));

export class AsanaClient extends TaskManagerClient {
    protected projectsApi: ProjectsApi;
    protected tasksApi: TasksApi;
    protected teamsApi: TeamsApi;
    protected usersApi: UsersApi;

    constructor(authToken: string) {
        super(authToken);

        this.projectsApi = new ProjectsApi(new Configuration({
            accessToken: authToken,
        }));
        this.tasksApi = new TasksApi(new Configuration({
            accessToken: authToken,
        }));
        this.teamsApi = new TeamsApi(new Configuration({
            accessToken: authToken,
        }));
        this.usersApi = new UsersApi(new Configuration({
            accessToken: authToken,
        }));
    }

    private createSnapTaskToCreateAsanaIssue(createSnapTask: CreateSnapTask, context: Context): CreateTaskOperationRequest {
        const data: TaskRequest = {
            workspace: context.workspaceId,
        };

        if (createSnapTask.assignee) {
            data.assignee = createSnapTask.assignee.id;
        }

        if (createSnapTask.description) {
            data.notes = createSnapTask.description;
        }

        if (createSnapTask.due_date) {
            data.dueOn = new Date(createSnapTask.due_date);
        }

        if (createSnapTask.project) {
            data.projects = [createSnapTask.project.id];
        }

        data.name = createSnapTask.title;
        data.workspace = context.workspaceId;

        return {
            createTaskRequest: {
                data: data,
            },
        };
    }

    private updateSnapTaskToUpdateAsanaIssue(updateSnapTask: UpdateSnapTask): AsanaUpdateTaskRequest {
        const data: TaskRequest = {};

        if (updateSnapTask.assignee) {
            data.assignee = updateSnapTask.assignee.id;
        }

        if (updateSnapTask.description) {
            data.notes = updateSnapTask.description;
        }

        if (updateSnapTask.due_date) {
            data.dueOn = new Date(updateSnapTask.due_date);
        }

        if (updateSnapTask.title) {
            data.name = updateSnapTask.title;
        }

        return {
            createTaskRequest: {
                data: data,
            },
            taskGid: updateSnapTask.id,
        };
    }

    private async getContext(transcript: string): Promise<Context> {
        const workspaceId = await this.usersApi.getUser({
            userGid: 'me',
        }).then(response => {
            if (response.data?.workspaces === undefined || response.data.workspaces.length === 0 || response.data.workspaces[0].gid === undefined) {
                throw new Error('No workspaces found.');
            }
            return response.data.workspaces[0].gid;
        }).catch(e => {
            console.error(e);
            throw new Error('could not load Asana workspace');
        });

        const teamId = await this.teamsApi.getTeamsForUser({
            organization: workspaceId,
            userGid: 'me',
        }).then(response => {
            if (response.data === undefined || response.data.length === 0 || response.data[0].gid === undefined) {
                throw new Error('No teams found.');
            }
            return response.data[0].gid;
        }).catch(e => {
            console.error(e);
            throw new Error('could not load Asana teams');
        });

        const projects = await this.projectsApi.getProjectsForTeam({
            teamGid: teamId,
        }).then(response => {
            if (response.data === undefined || response.data.length === 0) {
                throw new Error('No projects found.');
            }
            return response.data;
        }).then(projects => projects.map(project => ({
            id: project.gid,
            name: project.name,
        }))).then(
            projects => projects.filter(project => project.id !== undefined && project.name !== undefined),
        ).catch(e => {
            console.error(e);
            throw new Error('could not load Asana projects');
        });

        const users = await this.usersApi.getUsersForTeam({
            teamGid: teamId,
        }).then(response => {
            if (response.data === undefined || response.data.length === 0) {
                throw new Error('No users found.');
            }
            return response.data;
        }).then(users => users.map(user => ({
            id: user.gid,
            name: user.name,
        }))).then(
            users => users.filter(user => user.id !== undefined && user.name !== undefined),
        ).catch(e => {
            console.error(e);
            throw new Error('could not load Asana users');
        });

        return Context.parse({
            projects,
            teamId,
            transcript,
            users,
            workspaceId,
        });
    }

    private asanaIssueToSnapTask(asanaIssue: TaskResponse): SnapTask {
        const snapTask: SnapTask = {
            id: asanaIssue.gid || '',
            title: asanaIssue.name || '',
        };

        if (asanaIssue.completed) {
            snapTask.status = 'Done';
        }

        if (asanaIssue.dueOn) {
            snapTask.due_date = asanaIssue.dueOn.toString();
        }

        if (asanaIssue.notes) {
            snapTask.description = asanaIssue.notes;
        }

        if (asanaIssue.assignee && asanaIssue.assignee.gid && asanaIssue.assignee.name) {
            snapTask.assignee = {
                id: asanaIssue.assignee.gid,
                name: asanaIssue.assignee.name,
            };
        }

        if (asanaIssue.projects && asanaIssue.projects.length > 0 && asanaIssue.projects[0].gid && asanaIssue.projects[0].name) {
            snapTask.project = {
                id: asanaIssue.projects[0].gid,
                name: asanaIssue.projects[0].name,
            };
        }

        return snapTask;
    }

    public async processDiscussionTopic(topic: string, context: Context): Promise<ProcessTranscriptResponse> {
        const response: ProcessTranscriptResponse = {};

        const existingTasks: SnapTask[] = await this.tasksApi.searchTasksForWorkspace({
            text: topic,
            workspaceGid: context.workspaceId,
        }).then(response => {
            return response.data || [];
        }).then(tasks => {
            return tasks.filter(task => task.gid !== undefined).map(task => task.gid || '');
        }).then(ids => {
            return Promise.all(ids.map(id => {
                return this.tasksApi.getTask({
                    taskGid: id,
                });
            }));
        }).then(taskResponses => {
            const tasks: SnapTask[] = [];
            for (const response of taskResponses) {
                if (response.data === undefined) continue;
                tasks.push(this.asanaIssueToSnapTask(response.data));
            }
            return tasks;
        });

        const maxTries = 3;
        let curTry = 0;

        if (existingTasks.length === 0) {
            const messages: OpenAI.ChatCompletionMessageParam[] = [
                {
                    content: noExistingTasks,
                    role: 'system',
                },
                {
                    content: noExistingTasksContext(
                        context.transcript,
                        topic,
                        context.users.map(user => `- ${user.name} - ${user.id}`).join('\n'),
                        context.projects.map(project => `- ${project.name} - ${project.id}`).join('\n'),
                    ),
                    role: 'user',
                },
            ];

            while (curTry < maxTries) {
                const completion = await this.openai.chat.completions.create({
                    max_completion_tokens: 8000,
                    messages,
                    model: 'gpt-4.1',
                    temperature: 0.0,
                });

                try {
                    const content = JSON.parse(completion.choices[0].message.content as string);
                    const {data, error, success} = CreateTaskResponse.safeParse(content);

                    if (success && data) {
                        if (data.task) {
                            if (response.createTasks) {
                                response.createTasks.push(data.task);
                            } else {
                                response.createTasks = [data.task];
                            }
                        }
                        break;
                    }

                    if (error) {
                        messages.push({
                            content: completion.choices[0].message.content,
                            role: 'assistant',
                        }, {
                            content: error.message,
                            role: 'user',
                        });
                    }
                } catch (e) {
                    console.error(e);
                    messages.push({
                        content: e as string,
                        role: 'user',
                    });
                }
                curTry++;
            }

            if (curTry === maxTries) {
                console.error(messages.slice(2));
                throw new Error(`could not process discussion topic: ${topic}`);
            }
        } else {
            let messages: OpenAI.ChatCompletionMessageParam[] = [
                {
                    content: updateExistingTasks,
                    role: 'system',
                },
                {
                    content: existingTasksContext(
                        JSON.stringify(existingTasks, null, 2),
                        context.transcript,
                        topic,
                        context.users.map(user => `- ${user.name} - ${user.id}`).join('\n'),
                        context.projects.map(project => `- ${project.name} - ${project.id}`).join('\n'),
                    ),
                    role: 'user',
                },
            ];

            while (curTry < maxTries) {
                const completion = await this.openai.chat.completions.create({
                    max_completion_tokens: 8000,
                    messages,
                    model: 'gpt-4.1',
                    temperature: 0.0,
                });

                try {
                    const content = JSON.parse(completion.choices[0].message.content as string);
                    const {data, error, success} = UpdateTasksResponse.safeParse(content);
                    if (success && data) {
                        for (const update of data) {
                            const existingTask = existingTasks.find(task => task.id === update.id);
                            if (!existingTask || !update.updated_task) continue;

                            if (response.updateTasks) {
                                response.updateTasks.push({
                                    original: existingTask,
                                    updates: {
                                        id: existingTask.id,
                                        ...update.updated_task,
                                    },
                                });
                            } else {
                                response.updateTasks = [{
                                    original: existingTask,
                                    updates: {
                                        id: existingTask.id,
                                        ...update.updated_task,
                                    },
                                }];
                            }
                        }
                        break;
                    }

                    if (error) {
                        messages.push({
                            content: completion.choices[0].message.content,
                            role: 'assistant',
                        }, {
                            content: error.message,
                            role: 'user',
                        });
                    }
                } catch (e) {
                    console.error(e);
                    messages.push({
                        content: e as string,
                        role: 'user',
                    });
                }

                curTry++;
            }

            if (curTry === maxTries) {
                console.error(messages.slice(2));
                throw new Error(`could not process discussion topic: ${topic}`);
            }

            const updatedTasks = existingTasks.map(task => {
                const update = response.updateTasks?.find(update => update.original.id === task.id);
                if (update === undefined) {
                    return task;
                }
                return {
                    ...task,
                    ...update,
                };
            });

            messages = [
                {
                    content: createNewTask,
                    role: 'system',
                },
                {
                    content: existingTasksContext(
                        JSON.stringify(updatedTasks, null, 2),
                        context.transcript,
                        topic,
                        context.users.map(user => `- ${user.name} - ${user.id}`).join('\n'),
                        context.projects.map(project => `- ${project.name} - ${project.id}`).join('\n'),
                    ),
                    role: 'user',
                },
            ];

            curTry = 0;
            while (curTry < maxTries) {
                const completion = await this.openai.chat.completions.create({
                    max_completion_tokens: 8000,
                    messages,
                    model: 'gpt-4.1',
                    temperature: 0.0,
                });

                try {
                    const content = JSON.parse(completion.choices[0].message.content as string);
                    const {data, error, success} = CreateTaskResponse.safeParse(content);
                    if (success && data) {
                        if (data.task) {
                            if (response.createTasks) {
                                response.createTasks.push(data.task);
                            } else {
                                response.createTasks = [data.task];
                            }
                        }
                        break;
                    }

                    if (error) {
                        messages.push({
                            content: completion.choices[0].message.content,
                            role: 'assistant',
                        }, {
                            content: error.message,
                            role: 'user',
                        });
                    }
                } catch (e) {
                    console.error(e);
                    messages.push({
                        content: e as string,
                        role: 'user',
                    });
                }
                curTry++;
            }

            if (curTry === maxTries) {
                console.error(messages.slice(2));
                throw new Error(`could not process discussion topic: ${topic}`);
            }
        }

        return response;
    }

    async processTranscript(request: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse> {
        try {
            const context = await this.getContext(request.transcript);
            const discussionTopics = await this.extractDiscussionTopics(request.transcript);

            const createTasks: CreateSnapTask[] = [];
            const updateTasks: UpdateWithOriginal[] = [];

            for (const topic of discussionTopics) {
                const topicResponse = await this.processDiscussionTopic(topic, context);
                if (topicResponse.createTasks) {
                    createTasks.push(...topicResponse.createTasks);
                }
                if (topicResponse.updateTasks) {
                    updateTasks.push(...topicResponse.updateTasks);
                }
            }

            return {
                createTasks,
                updateTasks,
            };
        } catch (e) {
            throw new Error(`Error processing transcript: ${e}`);
        }
    }

    async createTask(request: CreateTaskRequest): Promise<void> {
        try {
            const context = await this.getContext('');
            await this.tasksApi.createTask(this.createSnapTaskToCreateAsanaIssue(request.createTask, context));
        } catch (e) {
            console.error(e);
            throw new Error('Error creating Asana task.');
        }
    }

    async updateTask(request: UpdateTaskRequest): Promise<void> {
        try {
            await this.tasksApi.updateTask(this.updateSnapTaskToUpdateAsanaIssue(request.updateTask));
        } catch (e) {
            console.error(e);
            throw new Error('Error updating Asana task.');
        }
    }
}