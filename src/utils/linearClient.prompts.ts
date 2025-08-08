export const createNewTask = `Review a provided transcript, a specific topic discussed within it, existing tasks, user details, and project details to determine if a task should be created regarding that topic. If so, generate an actionable task using the required JSON schema, referencing relevant transcript details. Your response must always provide structured reasoning before reaching a conclusion or producing any task output.

Carefully analyze the transcript to decide whether the discussed topic contains unresolved problems, action items, or requirements warranting a task. 
- Only create a task if it does not already exist, is substantive work, or clarification/follow-up is genuinely needed.
- If no task is warranted, explain why in your reasoning, and set all relevant output fields to null where appropriate.

**You must always follow this output structure and reasoning order:**
1. **reasoning**: Summarize and analyze how the transcript discusses the topic, citing specific transcript excerpts or context that support your assessment. Explain whether there are clear action items, unresolved needs, or sufficient reasons to create a task.
2. **conclusion**: Decide if a task should be created (yes or no), with a short rationale.
3. **task**: If a task should be created, fill out the task object with these exact fields:

- **assignee**: Object with \`id\` and \`name\`, if a specific person is assigned or mentioned for the task. If not mentioned, leave this field unset.
- **description**: A succinct summary of the task, referencing relevant transcript details.
- **due_date**: A due date, if a specific deadline is mentioned. If not mentioned, leave this field unset.
- **priority**: If mentioned (e.g., High, Medium, Low), otherwise leave this field unset.
- **project**: Object with \`id\` and \`name\`, if an explicit project is mentioned. If not mentioned, leave this field unset.
- **status**: If a status (e.g., In progress, To do, Blocked, Done) is directly mentioned or implied. If not mentioned, leave this field unset.
- **title**: A concise step/summary title for the task.

If no task is warranted, set the "task" field to null.

# Steps

1. Read and analyze the transcript and topic.
2. In the "reasoning" field, provide a detailed analysis referencing transcript excerpts that justify your assessment.
3. In the "conclusion" field, state clearly whether a task should be created, with brief rationale.
4. In the "task" field, provide a JSON object with all required fields as above, filling in details from the transcript or leaving fields unset where unmentioned.

# Output Format

Respond in JSON only, with the following structure and fields (do not include code formatting):

{
  "reasoning": "[step-by-step analysis, referencing transcript excerpts]",
  "conclusion": "[yes/no — is a task needed?, with 1-2 sentence rationale]",
  "task": {
    "assignee": {
      "id": "[assignee_id]",
      "name": "[assignee_name]"
    },
    "description": "[task description referencing transcript context]",
    "due_date": "[YYYY-MM-DD]",
    "priority": "[High/Medium/Low]",
    "project": {
      "id": "[project_id]",
      "name": "[project_name]"
    },
    "status": "[In progress/To do/Blocked/Done]",
    "title": "[concise task title]"
  }
}
- If any field (such as "due_date", "assignee", etc.) is not mentioned in the transcript, leave it unset.
- If a task is not needed, the "task" field should be null.

# Examples

_Example Input:_
Existing tasks list:
[
  {
    "id": "017de09ae14ff0",
    "description": "Fix styling in payments screen.",
    "due_date": "2023-05-18",
    "priority": "Medium",
    "project": {"id": "1030001deaaa02", "name": "Project Alpha"},
    "status": "To do",
    "title": "Payment module UI fix"
  }
]

Transcript:
"Carol: Bugs keep popping up in the payment module, and it’s affecting transactions.  
Dan: Should we create a ticket for the payments squad?  
Carol: Please assign it to me, and let's try to finish by next Friday.  
Dan: Make it high priority, and link it to Project Alpha."

Topic:
payment module bugs
- Bugs in the payment module are negatively effecting transactions
- This is a high priority task that should be done by next Friday
- Carol will do the task

Users:
Carol - 10300aef990dde
Dan - 10300dde74d50e

Projects:
Alpha - 1030001deaaa02

_Example Output:_
{
  "reasoning": "The transcript shows repeated issues in the payment module impacting transactions. Dan and Carol agree to create a task, assign it to Carol, set a due date (next Friday), mark it high priority, and link it to Project Alpha.",
  "conclusion": "Yes, a task should be created because there are clear, actionable steps and explicit assignments.",
  "task": {
    "assignee": {
      "id": "10300aef990dde",
      "name": "Carol"
    },
    "description": "Address persistent bugs in the payment module impacting transactions, as noted in the discussion between Carol and Dan. The task is for the payments squad and assigned to Carol.",
    "due_date": "2023-05-19",
    "priority": "High",
    "project": {
      "id": "1030001deaaa02",
      "name": "Project Alpha"
    },
    "title": "Fix recurring bugs in payment module"
  }
}

_Example Input (No task needed):_
Existing tasks list:
[
  {
    "id": "017de09ae14ff0",
    "description": "Fix styling in payments screen.",
    "due_date": "2023-05-18",
    "priority": "Medium",
    "project": {"id": "1030001deaaa02", "name": "Project Alpha"},
    "status": "To do",
    "title": "Payment module UI fix"
  }
]

Transcript:
"John: I heard there was an issue last week, but I think it's resolved.  
Kim: Yes, we finished testing it. No open problems remain on that front."

Topic: last week's issue

_Example Output:_
{
  "reasoning": "The transcript confirms the previous issue has been resolved and no open problems remain, according to Kim.",
  "conclusion": "No, a task is not needed as all related issues have already been addressed.",
  "task": null
}

(Real examples should be as detailed and accurate as the actual transcript allows. For long or multi-part transcripts, reasoning should reference multiple specific statements.)

# Notes

- Always reason before concluding or outputting any task.
- All output must be a single, valid JSON object (not in a code block).
- If no relevant field information is given, leave that field unset.
- Use the exact field names and nested object structures as shown above.
- For due_date, use YYYY-MM-DD format if a clear date is mentioned, otherwise leave it unset.

**REMINDER:**  
Carefully analyze the transcript for the specific topic. Provide step-by-step reasoning with transcript references before your conclusion. Capture all requested fields in the JSON as fully as transcript information allows—leave unset if not mentioned. Output must be in the specified JSON schema without any additional formatting.`;

export const noExistingTasks = `Review a provided transcript, a specific topic discussed within it, user details, and project details to determine if a task should be created regarding that topic. If so, generate an actionable task using the required JSON schema, referencing relevant transcript details. Your response must always provide structured reasoning before reaching a conclusion or producing any task output.

Carefully analyze the transcript to decide whether the discussed topic contains unresolved problems, action items, or requirements warranting a task. 
- Only create a task if substantive work or follow-up is genuinely needed and no task already exists for it.
- All work, no matter it's status, should be captured by a task.
- If no task is warranted, explain why in your reasoning, and set all relevant output fields to null where appropriate.

**You must always follow this output structure and reasoning order:**
1. **reasoning**: Summarize and analyze how the transcript discusses the topic, citing specific transcript excerpts or context that support your assessment. Explain whether there are clear action items, unresolved needs, or sufficient reasons to create a task.
2. **conclusion**: Decide if a task should be created (yes or no), with a short rationale.
3. **task**: If a task should be created, fill out the task object with these exact fields:

- **assignee**: Object with \`id\` and \`name\`, if a specific person is assigned or mentioned for the task. If not mentioned, leave this field unset.
- **description**: A succinct summary of the task, referencing relevant transcript details.
- **due_date**: A due date, if a specific deadline is mentioned. If not mentioned, leave this field unset.
- **priority**: If mentioned (e.g., High, Medium, Low), otherwise leave this field unset.
- **project**: Object with \`id\` and \`name\`, if an explicit project is mentioned. If not mentioned, leave this field unset.
- **status**: If a status (e.g., In progress, To do, Blocked, Done) is directly mentioned or implied. If not mentioned, leave this field unset.
- **title**: A concise step/summary title for the task.

If no task is warranted, set the "task" field to null.

# Steps

1. Read and analyze the transcript and topic.
2. In the "reasoning" field, provide a detailed analysis referencing transcript excerpts that justify your assessment.
3. In the "conclusion" field, state clearly whether a task should be created, with brief rationale.
4. In the "task" field, provide a JSON object with all required fields as above, filling in details from the transcript or leaving fields unset where unmentioned.

# Output Format

Respond in JSON only, with the following structure and fields (do not include code formatting):

{
  "reasoning": "[step-by-step analysis, referencing transcript excerpts]",
  "conclusion": "[yes/no — is a task needed?, with 1-2 sentence rationale]",
  "task": {
    "assignee": {
      "id": "[assignee_id]",
      "name": "[assignee_name]"
    },
    "description": "[task description referencing transcript context]",
    "due_date": "[YYYY-MM-DD]",
    "priority": "[High/Medium/Low]",
    "project": {
      "id": "[project_id]",
      "name": "[project_name]"
    },
    "status": "[In progress/To do/Blocked/Done]",
    "title": "[concise task title]"
  }
}
- If any field (such as "due_date", "assignee", etc.) is not mentioned in the transcript, leave it unset.
- If a task is not needed, the "task" field should be null.

# Examples

_Example Input:_
Transcript:
"Carol: Bugs keep popping up in the payment module, and it’s affecting transactions.  
Dan: Should we create a ticket for the payments squad?  
Carol: Please assign it to me, and let's try to finish by next Friday.  
Dan: Make it high priority, and link it to Project Alpha."

Topic:
payment module bugs
- Bugs in the payment module are negatively effecting transactions
- This is a high priority task that should be done by next Friday
- Carol will do the task

Users:
Carol - 10300aef990dde
Dan - 10300dde74d50e

Projects:
Alpha - 1030001deaaa02

_Example Output:_
{
  "reasoning": "The transcript shows repeated issues in the payment module impacting transactions. Dan and Carol agree to create a task, assign it to Carol, set a due date (next Friday), mark it high priority, and link it to Project Alpha.",
  "conclusion": "Yes, a task should be created because there are clear, actionable steps and explicit assignments.",
  "task": {
    "assignee": {
      "id": "10300aef990dde",
      "name": "Carol"
    },
    "description": "Address persistent bugs in the payment module impacting transactions, as noted in the discussion between Carol and Dan. The task is for the payments squad and assigned to Carol.",
    "due_date": "2023-05-19",
    "priority": "High",
    "project": {
      "id": "1030001deaaa02",
      "name": "Project Alpha"
    },
    "title": "Fix recurring bugs in payment module"
  }
}

_Example Input (No task needed):_
Transcript:
"John: I heard there was an issue last week, but I think it's resolved.  
Kim: Yes, we finished testing it. No open problems remain on that front."

Topic: last week's issue

_Example Output:_
{
  "reasoning": "The transcript confirms the previous issue has been resolved and no open problems remain, according to Kim.",
  "conclusion": "No, a task is not needed as all related issues have already been addressed.",
  "task": null
}

(Real examples should be as detailed and accurate as the actual transcript allows. For long or multi-part transcripts, reasoning should reference multiple specific statements.)

# Notes

- Always reason before concluding or outputting any task.
- All output must be a single, valid JSON object (not in a code block).
- If no relevant field information is given, leave that field unset.
- Use the exact field names and nested object structures as shown above.
- For due_date, use YYYY-MM-DD format if a clear date is mentioned, otherwise leave it unset.

**REMINDER:**  
Carefully analyze the transcript for the specific topic. Provide step-by-step reasoning with transcript references before your conclusion. Capture all requested fields in the JSON as fully as transcript information allows—leave unset if not mentioned. Output must be in the specified JSON schema without any additional formatting.`;

export const updateExistingTasks = `Analyze a provided transcript, a specific topic within it, user details, project details, and a list of existing tasks. For each task, determine whether updates are needed based on the transcript and topic. If any changes are warranted, produce the necessary updates in a new JSON object using the required schema; if no updates are needed for a task, output an object explaining why no changes are needed and leave all update fields unset (do not include them). Your response must always provide structured step-by-step reasoning before reaching a conclusion or outputting updates for each task.

Carefully compare the discussion in the transcript—specific to the topic—to each existing task:
- Identify whether any changes, additions, or corrections (such as to assignee, description, due_date, priority, project, status, or title) are warranted for each task.
- Only propose updates if substantive work, clarification, reassignment, deadline change, or revision is genuinely indicated by the transcript.
- If no update is warranted for a given task, explain why in your reasoning, and the "updated_task" object must be omitted from the output for that task.

**Always follow this structured sequence and reasoning order for each task:**
1. **id**: The id of the specific task. This must be included, and will be provided in the list of tasks.
2. **reasoning**: Analyze and summarize how the transcript discusses the topic in relation to the specific task, citing relevant transcript excerpts or context that justify your assessment. Describe whether updates or revisions to the task are warranted, and if so, which fields.
3. **conclusion**: Decide if any update to the task should be made (yes or no), providing a brief rationale.
4. **updated_task**: If changes are needed, provide only the fields that should change (and their new values) as a partial task object (as per the schema below). Do not include fields that did not change, and never set unchanged fields to null. If no update, do not include the "updated_task" field.

# Steps

1. For each existing task in the input list:
   - Analyze and compare the transcript for any new or updated information regarding the topic and the specific task.
   - In the "id" field, put the task's ID as given in the input.
   - In the "reasoning" field, reference relevant transcript excerpts or context supporting your decision.
   - In the "conclusion" field, clearly state whether any update is needed (yes/no) with a short rationale.
   - In the "updated_task" field, output a JSON object with only the relevant updated fields (see below); if no change, omit this field entirely.

2. Compile your output as a JSON array of these objects, maintaining the order of the input task list.

# Output Format

Respond with a JSON array; for each task, provide an object with this exact structure (do not include code formatting):

[
  {
    "id": "[task_id]",
    "reasoning": "[step-by-step analysis referencing transcript excerpts as they relate to this task]",
    "conclusion": "[yes/no — are updates to this task needed?, with 1-2 sentence rationale]",
    "updated_task": {
      // Only include fields that are being updated. 
      // Omit any field not being changed.
      // Valid fields: assignee, description, due_date, priority, project, status, title.
    }
  },
  ...
]

- Output an object for each input task, preserving order.
- Only include the "updated_task" field if updates are actually needed for the task.
- Within "updated_task", only include those subfields where a change is required. Omit all other fields.
- If NO update is needed for a given task, do NOT include the "updated_task" field; instead, explain why in the reasoning and conclusion.
- All reasoning and conclusions must precede (come before) any "updated_task" content within each entry.
- Output must be a single, well-formed JSON array, with no additional formatting or outer text.

# Examples

_Example Input:_

Existing tasks list:
[
  {
    "id": "017de09ae14ff0",
    "assignee": {"id": "10300aef990dde", "name": "Carol"},
    "description": "Fix bugs in the payment module, due by Thursday.",
    "due_date": "2023-05-18",
    "priority": "Medium",
    "project": {"id": "1030001deaaa02", "name": "Project Alpha"},
    "status": "To do",
    "title": "Payment module bugfix"
  }
]

Transcript:
"Carol: Bugs keep popping up in the payment module, and it’s affecting transactions.  
Dan: Should we create a ticket for the payments squad?  
Carol: Please assign it to me, and let's try to finish by next Friday.  
Dan: Make it high priority, and link it to Project Alpha."

Topic:
payment module bugs

Users:
Carol - 10300aef990dde  
Dan - 10300dde74d50e

Projects:
Alpha - 1030001deaaa02

_Example Output:_
[
  {
    "id": "017de09ae14ff0",
    "reasoning": "The transcript specifies that the previously 'Medium' priority should be updated to 'High', and the due date should be next Friday (2023-05-19), not Thursday. Carol remains the assignee, and the project linkage is unchanged.",
    "conclusion": "Yes, the task needs an updated due date and priority based on the transcript details.",
    "updated_task": {
      "due_date": "2023-05-19",
      "priority": "High"
    }
  }
]

_Example Input (No updates needed):_

Existing tasks list:
[
  {
    "id": "12355abde999ed",
    "assignee": {"id": "10300aef990dde", "name": "Carol"},
    "description": "Test and close payment module bugs.",
    "due_date": "2023-05-16",
    "priority": "Medium",
    "project": {"id": "1030001deaaa02", "name": "Project Alpha"},
    "status": "Done",
    "title": "Verify fix for payment module"
  }
]

Transcript:
"John: I heard there was an issue last week, but I think it's resolved.  
Kim: Yes, we finished testing it. No open problems remain on that front."

Topic: last week's issue

_Example Output:_
[
  {
    "id": "12355abde999ed",
    "reasoning": "The transcript clarifies that all issues are already resolved and testing is complete. The existing task status is already 'Done' and no further updates are mentioned.",
    "conclusion": "No, no updates are needed as the task is already appropriately marked as 'Done', matching the transcript information."
    // No "updated_task" field, as there are no changes.
  }
]

(Real examples should be as detailed as the actual input, with full reasoning and conclusions preceding any updates. Reasoning should reference specific transcript statements.)

# Notes

- Always provide step-by-step reasoning before your conclusion and updates for every task.
- For each task that needs updates, include only the changed fields within "updated_task", omitting all other fields.
- If no update is needed for a task, do not include the "updated_task" field at all.
- All output must be a single, valid JSON array (not in a code block), one object per input task.
- Use only the specified field names for any updated fields in "updated_task".
- Dates should always use the YYYY-MM-DD format.
- Never set fields to null—just omit them if no update is required.
- Output must contain no extra formatting or text—not even code blocks.

**REMINDER:**  
For each existing task, analyze the transcript for the specified topic, provide step-by-step reasoning with transcript references, then conclude and output only the required updates (omitting all unchanged fields and omitting the "updated_task" object entirely if no update is needed), in strict JSON as specified.`;

export const noExistingTasksContext = (transcript: string, topic: string, users: string, projects: string): string => {
    return `Transcript:
${transcript}

Topic: ${topic}

Users:
${users}

Projects:
${projects}`;
};

export const existingTasksContext = (existingTasks: string, transcript: string, topic: string, users: string, projects: string) => {
    return `Existing Tasks List:
${existingTasks}

${noExistingTasksContext(transcript, topic, users, projects)}`;
};