import z from 'zod';

export interface BaseIssue {
    assignee?: string;
    assigneeId?: string;
    createdAt: string;
    createdBy: string;
    createdById: string;
    description?: string;
    dueDate?: string;
    gitBranchName: string;
    id: string;
    identifier: string;
    parentId?: string;
    priority?: {
        name: string;
        value: number;
    };
    project?: string;
    projectId?: string;
    status: string;
    team: string;
    teamId: string;
    title: string;
    updatedAt: string;
    url: string;
}

export const BaseIssueSchema = z.object({
    assignee: z.string().optional(),
    assigneeId: z.string().optional(),
    createdAt: z.string(),
    createdBy: z.string(),
    createdById: z.string(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    gitBranchName: z.string(),
    id: z.string(),
    identifier: z.string(),
    parentId: z.string().optional(),
    priority: z.object({
        name: z.string(),
        value: z.number(),
    }).optional(),
    project: z.string().optional(),
    projectId: z.string().optional(),
    status: z.string(),
    team: z.string(),
    teamId: z.string(),
    title: z.string(),
    updatedAt: z.string(),
    url: z.string(),
});

export interface CreateIssue {
    assigneeId?: string;
    description?: string;
    dueDate?: string;
    labelIds?: string[];
    parentId?: string;
    priority?: number;
    projectId?: string;
    stateId?: string;
    teamId: string;
    title: string;
}

export const CreateIssueSchema = z.object({
    assigneeId: z.string().optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    labelIds: z.array(z.string()).optional(),
    parentId: z.string().optional(),
    priority: z.number().optional(),
    projectId: z.string().optional(),
    stateId: z.string().optional(),
    teamId: z.string(),
    title: z.string(),
});

export interface BaseUpdateIssue {
    assigneeId?: string;
    description?: string;
    dueDate?: string;
    estimate?: number;
    id: string;
    labelIds?: string[];
    parentId?: string;
    priority?: number;
    projectId?: string;
    stateId?: string;
    title?: string;
}

export interface UpdateIssue extends BaseUpdateIssue {
    originalIssue: BaseIssue;
}

export const UpdateIssueSchema = z.object({
    assigneeId: z.string().optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    estimate: z.number().optional(),
    id: z.string(),
    labelIds: z.array(z.string()).optional(),
    originalIssue: BaseIssueSchema,
    parentId: z.string().optional(),
    priority: z.number().optional(),
    projectId: z.string().optional(),
    stateId: z.string().optional(),
    title: z.string().optional(),
});

export function baseIssueToCreateIssue(
    issue: BaseIssue,
    teams: Team[],
): CreateIssue {
    return {
        ...issue,
        priority: issue.priority?.value,
        stateId: teams
            ?.find((team) => team.id === issue.teamId)
            ?.issueStatuses?.find((status) => status.name === issue.status)?.id,
    };
}

export function isUpdateIssue(
    issueCreateOrUpdate: CreateIssue | UpdateIssue,
): issueCreateOrUpdate is UpdateIssue {
    return (issueCreateOrUpdate as UpdateIssue).id !== undefined;
}

export interface IssueStatus {
    id: string;
    name: string;
    type: string;
}

export const IssueStatusSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
});

export interface IssueLabel {
    color: string;
    id: string;
    name: string;
}

export const IssueLabelSchema = z.object({
    color: z.string(),
    id: z.string(),
    name: z.string(),
});

export interface BaseCreateComment {
    body: string;
    issueId: string;
}

export interface CreateComment extends BaseCreateComment {
    issue: BaseIssue;
}

export const CreateCommentSchema = z.object({
    body: z.string(),
    issue: BaseIssueSchema,
    issueId: z.string(),
});

export interface BaseTeam {
    createdAt: string;
    id: string;
    name: string;
    updatedAt: string;
}

export const BaseTeamSchema = z.object({
    createdAt: z.string(),
    id: z.string(),
    name: z.string(),
    updatedAt: z.string(),
});

export interface Team extends BaseTeam {
    issueLabels: IssueLabel[];
    issueStatuses: IssueStatus[];
}

export const TeamSchema = BaseTeamSchema.extend({
    issueLabels: z.array(IssueLabelSchema),
    issueStatuses: z.array(IssueStatusSchema),
});

export interface User {
    createdAt: string;
    displayName: string;
    email: string;
    id: string;
    isActive: boolean;
    isAdmin: boolean;
    isGuest: boolean;
    name: string;
    status: string;
    updatedAt: string;
}

export const UserSchema = z.object({
    createdAt: z.string(),
    displayName: z.string(),
    email: z.string(),
    id: z.string(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    isGuest: z.boolean(),
    name: z.string(),
    status: z.string(),
    updatedAt: z.string(),
});

export interface Project {
    createdAt: string;
    description: string;
    id: string;
    name: string;
    summary: string;
    targetDate?: string;
    updatedAt: string;
    url: string;
}

export const ProjectSchema = z.object({
    createdAt: z.string(),
    description: z.string(),
    id: z.string(),
    name: z.string(),
    summary: z.string(),
    targetDate: z.string().optional(),
    updatedAt: z.string(),
    url: z.string(),
});