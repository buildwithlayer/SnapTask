import {LinearClient as ApiClient} from '@linear/sdk';
import {describe, expect, it} from 'vitest';
import {LinearClient} from '../linearClient.js';

describe('processDiscussionTopic', () => {
    const dummyAuth = 'DUMMYAUTH';
    const projects = [
        {
            id: 'bab9117f-9ed9-4208-92c6-da3075c4fd3d',
            name: 'Default',
        },
    ];
    const users = [
        {
            id: '3cbd2f09-e082-4598-bc07-cf6fd9b5f63c',
            name: 'Sarah',
        },
        {
            id: '967fde29-2ed8-4773-858a-5ef9ef62118a',
            name: 'Mike',
        },
        {
            id: '722a9fab-3a57-4672-ade0-6009e519886c',
            name: 'Priya',
        },
        {
            id: 'a1888f98-cbfb-4694-9288-5b14506acb4a',
            name: 'Ben',
        },
        {
            id: '59671546-ec99-41fa-91f8-89119ee10233',
            name: 'Lisa',
        },
    ];
    const transcript = `Sarah:
Good morning, everyone! Let’s get started with our updates. As usual: What did you work on yesterday, what’s on your plate today, and do you have any blockers?
Let’s start.

Mike:
Yesterday, I finished up the user login bug fix and pushed the changes to staging. Today, I’ll start working on the dashboard UI updates from the new design spec. No blockers right now.

Priya:
Yesterday, I tested the cart checkout feature and found an issue with the confirmation email not sending. I logged a ticket for it. Today, I’ll keep doing regression testing on the new product page. No blockers, but I might need some help with test data.

Ben:
Yesterday, I worked on optimizing the product search API. I fixed an issue with the query indexes after some help. Today, I’m taking on the inventory service updates. No current blockers.

Lisa:
Yesterday, I finished the new onboarding flow mockups and sent them out for feedback. Today, I’ll be going through the feedback and starting revisions. No blockers.

Sarah:
Thanks, everyone. Before we end, there’s something new that just came up: We received a request from support about users having trouble uploading profile pictures due to file size limits. We need to create a task to investigate the upload process and see if we can either increase the file size limit or improve the error messaging.

Mike:
That sounds good. Should this be a backend or frontend ticket?

Ben:
Probably both. The backend might need to handle larger files, and the frontend should display clear error messages.

Ben:
I can take the backend part and look into the current size limits.

Lisa:
I’ll handle the frontend. I can review the error messages and see how they can be improved.

Sarah:
Great, I’ll create two tickets and assign them accordingly.
Just a quick reminder: our sprint review is on Friday, so please have your tickets ready for review by then.
Anything else we need to discuss?

Priya:
Nope, that covers it for me.

Mike:
Nothing from me either.

Sarah:
Alright, thanks everyone! Have a great day.`;

    it('no existing tasks - no new task', async () => {
        const linearApiClient = {
            paginate: (_: never, __: never) => {
                return Promise.resolve([]);
            },
        };
        const linearClient = new LinearClient(dummyAuth, linearApiClient as unknown as ApiClient);
        const topic = 'Fix User Login Bug';
        const context = {
            projects,
            transcript,
            users,
        };

        const response = await linearClient.processDiscussionTopic(topic, context);
        expect(response.createTasks).toBeUndefined();
        expect(response.updateTasks).toBeUndefined();
    });

    it('no existing tasks - new task', async () => {
        const linearApiClient = {
            paginate: (_: never, __: never) => {
                return Promise.resolve([]);
            },
        };
        const linearClient = new LinearClient(dummyAuth, linearApiClient as unknown as ApiClient);
        const topic = 'Update Dashboard UI';
        const context = {
            projects,
            transcript,
            users,
        };

        const response = await linearClient.processDiscussionTopic(topic, context);
        expect(response.createTasks).toHaveLength(1);
        expect(response.updateTasks).toBeUndefined();
    });

    it('existing tasks - no updates, no new tasks', async () => {
        const linearApiClient = {
            paginate: (_: never, __: never) => {
                return Promise.resolve([
                    {
                        assigneeId: '967fde29-2ed8-4773-858a-5ef9ef62118a',
                        description: 'Currently, something causes the login button to be disabled before the user has a chance to click it.',
                        id: 'dbb9b2d9-13fb-46ad-993d-1c01d4c61765',
                        projectId: 'bab9117f-9ed9-4208-92c6-da3075c4fd3d',
                        stateId: 'Done',
                        title: 'Fix button disabled bug on login',
                    },
                ]);
            },
        };
        const linearClient = new LinearClient(dummyAuth, linearApiClient as unknown as ApiClient);
        const topic = 'Fix User Login Bug';
        const context = {
            projects,
            transcript,
            users,
        };

        const response = await linearClient.processDiscussionTopic(topic, context);
        expect(response.createTasks).toBeUndefined();
        expect(response.updateTasks).toBeUndefined();
    });

    it('existing tasks - updates, no new tasks', async () => {
        const linearApiClient = {
            paginate: (_: never, __: never) => {
                return Promise.resolve([
                    {
                        description: 'Currently, something causes the login button to be disabled before the user has a chance to click it.',
                        id: 'dbb9b2d9-13fb-46ad-993d-1c01d4c61765',
                        projectId: 'bab9117f-9ed9-4208-92c6-da3075c4fd3d',
                        stateId: 'In Progress',
                        title: 'Fix button disabled bug on login',
                    },
                ]);
            },
        };
        const linearClient = new LinearClient(dummyAuth, linearApiClient as unknown as ApiClient);
        const topic = 'Fix User Login Bug';
        const context = {
            projects,
            transcript,
            users,
        };

        const response = await linearClient.processDiscussionTopic(topic, context);
        expect(response.createTasks).toBeUndefined();
        expect(response.updateTasks).toHaveLength(1);
    });

    it('existing tasks - no updates, new tasks', async () => {
        const linearApiClient = {
            paginate: (_: never, __: never) => {
                return Promise.resolve([
                    {
                        assigneeId: '967fde29-2ed8-4773-858a-5ef9ef62118a',
                        description: 'Currently, something causes the login button to be disabled before the user has a chance to click it.',
                        id: 'dbb9b2d9-13fb-46ad-993d-1c01d4c61765',
                        projectId: 'bab9117f-9ed9-4208-92c6-da3075c4fd3d',
                        stateId: 'Done',
                        title: 'Fix button disabled bug on login',
                    },
                ]);
            },
        };
        const linearClient = new LinearClient(dummyAuth, linearApiClient as unknown as ApiClient);
        const topic = 'Update Dashboard UI';
        const context = {
            projects,
            transcript,
            users,
        };

        const response = await linearClient.processDiscussionTopic(topic, context);
        expect(response.createTasks).toHaveLength(1);
        expect(response.updateTasks).toBeUndefined();
    });
});