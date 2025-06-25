import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const EXTRACT_SUMMARY_PROMPT = `
You are a helpful assistant that extracts the summary of a transcript.

The transcript is:
{transcript}

The summary is:
`;

export const extractSummary = async (transcript: string): Promise<string> => {
    const completion = await openai.chat.completions.create({
        max_tokens: 1000,
        messages: [
            {
                content: EXTRACT_SUMMARY_PROMPT.replace('{transcript}', transcript),
                role: 'user',
            },
        ],
        model: 'o3-mini',
        temperature: 0.7,
    });

    return completion.choices[0].message.content || '';
};