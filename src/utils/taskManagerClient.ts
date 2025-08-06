import OpenAI from 'openai';
import z from 'zod';
import {CreateSnapTask, UpdateSnapTask} from '../schemas/snapTask.js';

const AuthenticatedRequest = z.object({
    authToken: z.string(),
});

export const ProcessTranscriptRequest = AuthenticatedRequest.extend({
    transcript: z.string(),
});

export type ProcessTranscriptRequest = z.infer<typeof ProcessTranscriptRequest>;

export const ProcessTranscriptResponse = z.object({
    createTasks: z.array(CreateSnapTask).optional(),
    updateTasks: z.array(UpdateSnapTask).optional(),
});

export type ProcessTranscriptResponse = z.infer<typeof ProcessTranscriptResponse>;

export const CreateTaskRequest = AuthenticatedRequest.extend({
    createTask: CreateSnapTask,
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

export const UpdateTaskRequest = AuthenticatedRequest.extend({
    updateTask: UpdateSnapTask,
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

export const DiscussionTopic = z.object({
    importantPoints: z.array(z.string()),
    searchTerm: z.string(),
    summary: z.string(),
});

export type DiscussionTopic = z.infer<typeof DiscussionTopic>;

const DiscussionTopics = z.array(DiscussionTopic);

export abstract class TaskManagerClient {
    protected async extractDiscussionTopics(transcript: string): Promise<DiscussionTopic[]> {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const maxTries = 3;
        let curTry = 0;

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            {
                content: `Extract discussion topics from the given transcript, providing for each topic a concise summary, a relevant search term, and a list of its most important points.

- Read the entire transcript carefully.
- Identify all significant discussion topics, regardless of frequency or relation to each other.
- For each topic, do NOT interpret the stance or outcome—represent only the topic's content and context.
- Perform thorough internal reasoning: FIRST, consider all possible topics, then group related utterances to extract the required details for each topic before producing the final output.
- For each topic, generate the following:
  - summary: A 1-3 sentence description of the topic as it appears in the transcript.
  - searchTerm: A concise keyword or short phrase (3-7 words) suitable for searching or tagging the topic; do NOT include subpoints or details.
  - importantPoints: A list of 2-5 key points, facts, or aspects mentioned in the transcript about this topic—these should be direct, clear bullet points based on the conversation.

# Steps

1. Read and understand the transcript in full.
2. Identify all standalone or major discussion topics.
3. For each topic:
   - Gather all relevant utterances and details from the transcript.
   - Write a concise summary of the topic, capturing the main points.
   - Choose a brief search term or phrase that best represents the topic.
   - List all important points about the topic as directly stated or implied in the conversation.
4. Produce ONLY a JSON array of topic objects as described in the output format, with NO extra explanation.

# Output Format

Your output must be a JSON array.  
Each element is a JSON object with the following fields:
  - summary: string (1-3 sentences describing the topic as it arises in the transcript)
  - searchTerm: string (3-7 words summarizing the topic, suitable as a search keyword)
  - importantPoints: array of strings (2-5 points directly from the discussion; each point is clear and self-contained)

Example syntax:

[
  {
    "summary": "The team discussed the need to update the hiring process, noting that automation could improve efficiency and reduce manual workload.",
    "searchTerm": "Hiring process improvements",
    "importantPoints": [
      "Need to update hiring steps",
      "Consider automating certain processes",
      "Aim to reduce manual work"
    ]
  },
  {
    "summary": "Participants referenced recent testing of the payroll software, asking if anyone had tried it last week and expressing interest in feedback.",
    "searchTerm": "Payroll software testing",
    "importantPoints": [
      "Recent rollout of new payroll software",
      "Team asked if testing was completed",
      "Interest in performance feedback"
    ]
  }
]

(For longer transcripts, generate additional topic objects as needed. Real examples should include all major topics, and importantPoints lists should use direct evidence from the transcript.)

# Important Reminders

- Reason internally to identify topics and details before filling out any fields.
- Output ONLY the JSON array of topic objects (no explanation, no extra text).
- An empty JSON array is allowed if no topics are discussed.
- Do NOT include subpoints, interpretations, stances, or context not present in the transcript.
- Each searchTerm should be a concise phrase—no sentences or unnecessary details.
- Each summary must be factual and based strictly on transcript content.
- Each importantPoints list should only include key facts or aspects as directly mentioned.

If this prompt is long, review these instructions again before starting to ensure all requirements are met.`,
                role: 'system',
            },
            {
                content: transcript,
                role: 'user',
            },
        ];

        while (curTry < maxTries) {
            const completion = await openai.chat.completions.create({
                max_completion_tokens: 8000,
                messages,
                model: 'gpt-4.1',
                temperature: 0.05,
            });

            const {data, error, success} = DiscussionTopics.safeParse(completion.choices[0].message.content);
            if (success && data) {
                return data;
            }

            if (error) {
                messages.push({
                    content: completion.choices[0].message.content,
                    role: 'assistant',
                }, {
                    content: error.message,
                    role: 'user',
                });
            }
            curTry++;
        }

        console.error(messages.slice(2));
        throw new Error('could not extract discussion topics');
    }

    public abstract processTranscript(request: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse>;

    public abstract createTask(request: CreateTaskRequest): Promise<void>;

    public abstract updateTask(request: UpdateTaskRequest): Promise<void>;
}