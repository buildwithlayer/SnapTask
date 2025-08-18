import {z} from 'zod';
import {TaskManagerClient} from './taskManagerClient.js';

const SuggestedIssue = z.object({
    id: z.onumber(),
    img: z.ostring(),
    key: z.ostring(),
    keyHtml: z.ostring(),
    summary: z.ostring(),
    summaryText: z.ostring(),
});

type SuggestedIssue = z.infer<typeof SuggestedIssue>;

const IssuePickerSuggestionsIssue = z.object({
    id: z.ostring(),
    issues: z.array(SuggestedIssue).optional(),
    label: z.ostring(),
    msg: z.ostring(),
    sub: z.ostring(),
});

type IssuePickerSuggestionsIssue = z.infer<typeof IssuePickerSuggestionsIssue>;

const IssuePickerSuggestions = z.object({
    sections: z.array(IssuePickerSuggestionsIssue).optional(),
});

type IssuePickerSuggestions = z.infer<typeof IssuePickerSuggestions>;

export class JiraClient extends TaskManagerClient {

}