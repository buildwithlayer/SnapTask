import {
    CreateTaskRequest,
    ProcessTranscriptRequest,
    ProcessTranscriptResponse,
    TaskManagerClient,
    UpdateTaskRequest,
} from './taskManagerClient.js';

export class MockClient extends TaskManagerClient {
    createTask(_: CreateTaskRequest): Promise<void> {
        return Promise.resolve();
    }

    processTranscript(_: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse> {
        return Promise.resolve({
            createTasks: [
                {
                    title: 'Improve Prompting for Processing Transcripts',
                },
                {
                    assignee: {
                        id: 'DEADBEEF',
                        name: 'John',
                    },
                    description: 'There is a bug in the front-end where the log-in button is disabled on first visit.',
                    due_date: new Date().toDateString(),
                    priority: 1,
                    project: {
                        id: 'FEEBDAED',
                        name: 'Default',
                    },
                    status: 'To Do',
                    title: 'Fix Log-In Button Disabled Bug',
                },
            ],
            updateTasks: [
                {
                    original: {
                        assignee: {
                            id: 'DEADBEEF',
                            name: 'John',
                        },
                        description: 'There is a bug in the front-end where the log-in button is disabled on first visit.',
                        due_date: new Date().toDateString(),
                        id: 'DEADBEEF',
                        priority: 1,
                        project: {
                            id: 'FEEBDAED',
                            name: 'Default',
                        },
                        status: 'To Do',
                        title: 'Fix Log-In Button Disabled Bug',
                    },
                    updates: {
                        id: 'DEADBEEF',
                        status: 'Done',
                    },
                },
                {
                    original: {
                        assignee: {
                            id: 'DEADBEEF',
                            name: 'John',
                        },
                        description: 'There is a bug in the front-end where the log-in button is disabled on first visit.',
                        due_date: new Date().toDateString(),
                        id: 'FEEBDAED',
                        priority: 1,
                        project: {
                            id: 'FEEBDAED',
                            name: 'Default',
                        },
                        status: 'To Do',
                        title: 'Fix Log-In Button Disabled Bug',
                    },
                    updates: {
                        assignee: {
                            id: 'DEADBEEF',
                            name: 'John',
                        },
                        description: 'There is a bug in the front-end where the log-in button is disappears when the user clicks it.',
                        due_date: new Date().toDateString(),
                        id: 'FEEBDAED',
                        priority: 1,
                        project: {
                            id: 'FEEBDAED',
                            name: 'Default',
                        },
                        status: 'To Do',
                        title: 'Fix Log-In Button Disappearing Bug',
                    },
                },
            ],
        });
    }

    updateTask(_: UpdateTaskRequest): Promise<void> {
        return Promise.resolve();
    }
}