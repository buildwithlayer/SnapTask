import z from 'zod';

export const SnapTask = z.object({
    assignee: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
    description: z.ostring(),
    due_date: z.ostring(),
    id: z.string(),
    priority: z.onumber(),
    project: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
    status: z.ostring(),
    title: z.string(),
});

export type SnapTask = z.infer<typeof SnapTask>;

export const CreateSnapTask = SnapTask.omit({
    id: true,
});

export type CreateSnapTask = z.infer<typeof CreateSnapTask>;

export const UpdateSnapTask = SnapTask.extend({
    title: z.ostring(),
});

export type UpdateSnapTask = z.infer<typeof UpdateSnapTask>;