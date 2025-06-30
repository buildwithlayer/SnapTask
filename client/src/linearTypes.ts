export interface BaseIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  url: string;
  gitBranchName: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  labels: any[];
  attachments: any[];
  createdBy: string;
  createdById: string;
  project?: string;
  projectId?: string;
  assignee?: string;
  assigneeId?: string;
  parentId?: string;
  team: string;
  teamId: string;
  priority?: {
    value: number;
    name: string;
  };
  dueDate?: string;
}

export interface CreateIssue {
  title: string;
  description?: string;
  teamId: string;
  priority?: number;
  projectId?: string;
  parentId?: string;
  stateId?: string;
  assigneeId?: string;
  labelIds?: string[];
  dueDate?: string;
}

export interface BaseUpdateIssue {
  id: string;
  title?: string;
  description?: string;
  priority?: number;
  projectId?: string;
  parentId?: string;
  stateId?: string;
  assigneeId?: string;
  labelIds?: string[];
  dueDate?: string;
  estimate?: number;
}

export interface UpdateIssue extends BaseUpdateIssue {
  originalIssue: BaseIssue;
}

export function baseIssueToCreateIssue(
  issue: BaseIssue,
  teams: Team[]
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
  issueCreateOrUpdate: CreateIssue | UpdateIssue
): issueCreateOrUpdate is UpdateIssue {
  return (issueCreateOrUpdate as UpdateIssue).id !== undefined;
}

export interface IssueStatus {
  id: string;
  type: string;
  name: string;
}

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
}

export interface BaseCreateComment {
  issueId: string;
  body: string;
}

export interface CreateComment extends BaseCreateComment {
  issue: BaseIssue;
}

export interface BaseTeam {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team extends BaseTeam {
  issueStatuses: IssueStatus[];
  issueLabels: IssueLabel[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isGuest: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  targetDate?: string;
}

export interface CreateProject {
  name: string;
  summary?: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  teamId: string;
}
