import {expect, test} from 'vitest';
import {LinearClient} from '../linearClient.js';

test('extractDiscussionTopics', async () => {
    const authToken = 'DUMMYDATA';
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

    const linearClient = new LinearClient(authToken);
    const discussionTopics = await linearClient.extractDiscussionTopics(transcript);

    const expectedTopics = [
        'Fix User Login Bug',
        'Update Dashboard UI',
        'Test Cart Checkout Feature',
        'Log Confirmation Email Issue',
        'Perform Regression Testing Product Page',
        'Optimize Product Search API',
        'Update Inventory Service',
        'Create Onboarding Flow Mockups',
        'Review Onboarding Flow Feedback',
        'Revise Onboarding Flow Mockups',
        'Investigate Profile Picture Upload Process',
        'Increase Profile Picture File Size Limit',
        'Improve Profile Picture Error Messaging',
        'Prepare Tickets For Sprint Review',
    ];

    const intersection = expectedTopics.filter(topic => discussionTopics.includes(topic));
    const union = [...expectedTopics, ...discussionTopics.filter(topic => !expectedTopics.includes(topic))];
    const iou = intersection.length / union.length;

    console.debug(`IOU: ${iou}`);
    expect(iou).toBeGreaterThan(2/3);
});