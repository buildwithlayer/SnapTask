declare module 'asana' {
    export class ApiClient {
        static instance: ApiClient;
        authentications: {
            token: {
                accessToken: string;
            };
        };
    }

    export class TasksApi {
        createTask(body: CreateTaskBody, opts?: never): Promise<CreateTaskResult>;
    }

    export type CreateTaskBody = {
        data: {
            name: string;
            notes: string;
            projects: string[];
        };
    };

    export type CreateTaskResult = {
        id: string;
        name: string;
        notes: string;
    }

    export class WorkspacesApi {
        getWorkspaces(body: GetWorkspacesBody): Promise<GetWorkspacesResult>;
    }

    export type GetWorkspacesBody = {
        limit?: number;
        offset?: string;
        opt_fields?: string;
    }

    export type GetWorkspacesResult = {
        data: {
            gid: string;
            name: string;
            resource_type: string;
        }[];
        next_page?: {
            offset: string;
            path: string;
            uri: string;
        }
    }
}