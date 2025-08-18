import {Issue, IssueSearchResult, LinearClient as ApiClient} from '@linear/sdk';
import OpenAI from 'openai';
import {z} from 'zod';
import type {IssueCreateInput, IssueUpdateInput} from '@linear/sdk/dist/_generated_documents.js';
import {CreateSnapTask, type SnapTask, UpdateSnapTask} from '../schemas/snapTask.js';
import {
    createNewTask,
    existingTasksContext,
    noExistingTasks,
    noExistingTasksContext,
    updateExistingTasks,
} from './linearClient.prompts.js';
import {
    type CreateTaskRequest,
    type ProcessTranscriptRequest,
    type ProcessTranscriptResponse,
    TaskManagerClient,
    type UpdateTaskRequest, UpdateWithOriginal,
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
    transcript: z.string(),
    users: z.array(User),
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

export class LinearClient extends TaskManagerClient {
    protected apiClient: ApiClient;

    constructor(authToken: string, apiClient?: ApiClient) {
        super(authToken);

        if (apiClient) {
            this.apiClient = apiClient;
        } else {
            this.apiClient = new ApiClient({
                accessToken: authToken,
            });
        }
    }

    private createSnapTaskToCreateLinearIssue(createSnapTask: CreateSnapTask, teamId: string): IssueCreateInput {
        return {
            assigneeId: createSnapTask.assignee?.id,
            description: createSnapTask.description,
            dueDate: createSnapTask.due_date,
            priority: createSnapTask.priority,
            projectId: createSnapTask.project?.id,
            stateId: createSnapTask.status,
            teamId,
            title: createSnapTask.title,
        };
    }

    private updateSnapTaskToUpdateLinearIssue(updateSnapTask: UpdateSnapTask): IssueUpdateInput {
        const issueUpdateInput: IssueUpdateInput = {};
        if (updateSnapTask.assignee) {
            issueUpdateInput.assigneeId = updateSnapTask.assignee.id;
        }
        if (updateSnapTask.description) {
            issueUpdateInput.description = updateSnapTask.description;
        }
        if (updateSnapTask.due_date) {
            issueUpdateInput.dueDate = updateSnapTask.due_date;
        }
        if (updateSnapTask.priority) {
            issueUpdateInput.priority = updateSnapTask.priority;
        }
        if (updateSnapTask.project) {
            issueUpdateInput.projectId = updateSnapTask.project.id;
        }
        if (updateSnapTask.status) {
            issueUpdateInput.stateId = updateSnapTask.status;
        }
        if (updateSnapTask.title) {
            issueUpdateInput.title = updateSnapTask.title;
        }
        return issueUpdateInput;
    }

    public async getContext(transcript: string): Promise<Context> {
        const projects = await this.apiClient.paginate(this.apiClient.projects, {})
            .then(projects => projects.map(project => ({id: project.id, name: project.name})))
            .catch(e => {
                console.error(e);
                throw new Error('could not load Linear projects');
            });

        const users = await this.apiClient.paginate(this.apiClient.users, {})
            .then(users => users.map(user => ({id: user.id, name: user.name})))
            .catch(e => {
                console.error(e);
                throw new Error('could not load Linear users');
            });

        return {
            projects,
            transcript,
            users,
        };
    }

    private linearIssueToSnapTask(linearIssue: Issue | IssueSearchResult, context: Context): SnapTask {
        const snapTask: SnapTask = {
            id: linearIssue.id,
            title: linearIssue.title,
        };

        if (linearIssue.assigneeId) {
            const user = context.users.find(user => user.id === linearIssue.assigneeId);
            if (user !== undefined) {
                snapTask.assignee = user;
            }
        }

        if (linearIssue.description) {
            snapTask.description = linearIssue.description;
        }

        if (linearIssue.dueDate) {
            snapTask.due_date = linearIssue.dueDate;
        }

        if (linearIssue.priority) {
            snapTask.priority = linearIssue.priority;
        }

        if (linearIssue.projectId) {
            const project = context.projects.find(project => project.id === linearIssue.projectId);
            if (project !== undefined) {
                snapTask.project = project;
            }
        }

        if (linearIssue.stateId) {
            snapTask.status = linearIssue.stateId;
        }

        return snapTask;
    }

    public async processDiscussionTopic(topic: string, context: Context): Promise<ProcessTranscriptResponse> {
        const response: ProcessTranscriptResponse = {};

        const existingTasks: SnapTask[] = await this.apiClient.searchIssues(topic)
            .then(payload => payload.nodes)
            .then(nodes => nodes.map(node => this.linearIssueToSnapTask(node, context)));

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
        const teams = await this.apiClient.teams();
        if (teams.nodes.length === 0) {
            throw new Error('No available Linear teams.');
        }
        const team = teams.nodes[0];
        try {
            await this.apiClient.createIssue(this.createSnapTaskToCreateLinearIssue(request.createTask, team.id));
        } catch (e) {
            console.error(e);
            throw new Error('Error creating Linear issue.');
        }
    }

    async updateTask(request: UpdateTaskRequest): Promise<void> {
        try {
            await this.apiClient.updateIssue(request.updateTask.id, this.updateSnapTaskToUpdateLinearIssue(request.updateTask));
        } catch (e) {
            console.error(e);
            throw new Error('Error updating Linear issue.');
        }
    }
}