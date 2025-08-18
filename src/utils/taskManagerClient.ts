import OpenAI from 'openai';
import z from 'zod';
import {CreateSnapTask, SnapTask, UpdateSnapTask} from '../schemas/snapTask.js';
import {extractDiscussionTopics} from './taskManagerClient.prompts.js';

const AuthenticatedRequest = z.object({
    authProvider: z.enum(['linear', 'mock']),
    authToken: z.string(),
});

export const ProcessTranscriptRequest = AuthenticatedRequest.extend({
    transcript: z.string(),
});

export type ProcessTranscriptRequest = z.infer<typeof ProcessTranscriptRequest>;

export const UpdateWithOriginal = z.object({
    original: SnapTask,
    updates: UpdateSnapTask,
});

export type UpdateWithOriginal = z.infer<typeof UpdateWithOriginal>;

export const ProcessTranscriptResponse = z.object({
    createTasks: z.array(CreateSnapTask).optional(),
    updateTasks: z.array(UpdateWithOriginal).optional(),
});

export type ProcessTranscriptResponse = z.infer<typeof ProcessTranscriptResponse>;

export const CreateTaskRequest = AuthenticatedRequest.extend({
    createTask: CreateSnapTask,
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

export const UpdateTaskRequest = AuthenticatedRequest.extend({
    updateTask: UpdateSnapTask,
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

const DiscussionTopics = z.array(z.string());

export abstract class TaskManagerClient {
    protected authToken: string;
    protected openai: OpenAI;

    constructor(authToken: string) {
        this.authToken = authToken;
        this.openai = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });
    }

    public async extractDiscussionTopics(transcript: string): Promise<string[]> {
        const maxTries = 3;
        let curTry = 0;

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            {
                content: extractDiscussionTopics,
                role: 'system',
            },
            {
                content: transcript,
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

            const {
                data,
                error,
                success,
            } = DiscussionTopics.safeParse(JSON.parse(completion.choices[0].message.content || '[]'));
            if (success && data) {
                return data;
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
            curTry++;
        }

        console.error(messages.slice(2));
        throw new Error('could not extract discussion topics');
    }

    public abstract processTranscript(request: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse>;

    public abstract createTask(request: CreateTaskRequest): Promise<void>;

    public abstract updateTask(request: UpdateTaskRequest): Promise<void>;
}