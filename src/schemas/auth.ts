import {z} from 'zod';

export const LinearAuthRequestSchema = z.object({
    code: z.string(),
    grant_type: z.string(),
});

export type LinearAuthRequestSchema = z.infer<typeof LinearAuthRequestSchema>;

export const LinearAuthResponseSchema = z.object({
    access_token: z.string(),
});

export type LinearAuthResponseSchema = z.infer<typeof LinearAuthResponseSchema>;