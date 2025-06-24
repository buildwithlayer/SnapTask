import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const EXTRACT_SUMMARY_PROMPT = `
You are a helpful assistant that extracts the summary of a transcript.

The transcript is:
{transcript}

The summary is:
`;

export const extractSummary = async (transcript: string): Promise<string> => {
    const { text } = await generateText({
        model: openai('o3-mini'),
        prompt: EXTRACT_SUMMARY_PROMPT.replace('{transcript}', transcript),
    });
    return text;
};