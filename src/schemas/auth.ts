import {z} from 'zod';

export const AsanaAuthRequestSchema = z.object({
    code: z.string(),
    grant_type: z.string(),
});

export type AsanaAuthRequestSchema = z.infer<typeof AsanaAuthRequestSchema>;

export const AsanaAuthResponseSchema = z.object({
    access_token: z.string(),
});

export type AsanaAuthResponseSchema = z.infer<typeof AsanaAuthResponseSchema>;

export const JiraAuthRequestSchema = z.object({
    code: z.string(),
    grant_type: z.string(),
});

export type JiraAuthRequestSchema = z.infer<typeof JiraAuthRequestSchema>;

export const JiraAuthResponseSchema = z.object({
    access_token: z.string(),
});

export type JiraAuthResponseSchema = z.infer<typeof JiraAuthResponseSchema>;

export const LinearAuthRequestSchema = z.object({
    code: z.string(),
    grant_type: z.string(),
});

export type LinearAuthRequestSchema = z.infer<typeof LinearAuthRequestSchema>;

export const LinearAuthResponseSchema = z.object({
    access_token: z.string(),
});

export type LinearAuthResponseSchema = z.infer<typeof LinearAuthResponseSchema>;