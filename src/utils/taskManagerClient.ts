import z from 'zod';
import {CreateSnapTask, UpdateSnapTask} from '../schemas/snapTask.js';

const AuthenticatedRequest = z.object({
    authToken: z.string(),
});

const ProcessTranscriptRequest = AuthenticatedRequest.extend({
    transcript: z.string(),
});

type ProcessTranscriptRequest = z.infer<typeof ProcessTranscriptRequest>;

const ProcessTranscriptResponse = z.object({
    createTasks: z.array(CreateSnapTask).optional(),
    updateTasks: z.array(UpdateSnapTask).optional(),
});

const CreateTaskRequest = AuthenticatedRequest.extend({
    createTask: CreateSnapTask,
});

type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

type ProcessTranscriptResponse = z.infer<typeof ProcessTranscriptResponse>;

const UpdateTaskRequest = AuthenticatedRequest.extend({
    updateTask: UpdateSnapTask,
});

type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

export abstract class TaskManagerClient {
    public abstract processTranscript(request: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse>;
    public abstract createTask(request: CreateTaskRequest): Promise<void>;
    public abstract updateTask(request: UpdateTaskRequest): Promise<void>;
}