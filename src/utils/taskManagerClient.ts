import z from 'zod';
import {CreateSnapTask, UpdateSnapTask} from '../schemas/snapTask.js';

const AuthenticatedRequest = z.object({
    authToken: z.string(),
});

export const ProcessTranscriptRequest = AuthenticatedRequest.extend({
    transcript: z.string(),
});

export type ProcessTranscriptRequest = z.infer<typeof ProcessTranscriptRequest>;

export const ProcessTranscriptResponse = z.object({
    createTasks: z.array(CreateSnapTask).optional(),
    updateTasks: z.array(UpdateSnapTask).optional(),
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

export abstract class TaskManagerClient {
    public abstract processTranscript(request: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse>;
    public abstract createTask(request: CreateTaskRequest): Promise<void>;
    public abstract updateTask(request: UpdateTaskRequest): Promise<void>;
}