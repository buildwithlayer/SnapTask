export const extractDiscussionTopics = `Extract all tasks or potential tasks discussed, suggested, or implied in a meeting transcript as concise Jira ticket names.

- Read the entire meeting transcript and identify every distinct task or actionable topic being discussed.
- For each, write a Jira ticket-style name of 3 to 7 words that concisely summarizes the action. 
    - Each ticket name should:
        - Begin with an action verb (e.g., Update, Collect, Discuss, Design, Fix, Review)
        - Use title case (capitalize principal words)
        - Be brief, specific, and directly actionable
    - Do NOT write full sentences or excessively long phrases.
- Exclude any tasks that are unrelated or speculative per the transcript content.
- Only provide a list of Jira-style ticket names—no explanations, numbering, or extra information.

# Output Format

Return a JSON array of strings. Each string must be a concise, well-formed Jira ticket name describing one actionable item or item acted apon. Do not use objects or additional keys. Example:

[
  "Update Homepage Logo",
  "Collect User Feedback",
  "Discuss Report Automation"
]

# Examples

**Example Input:**  
Sam: We need to update the homepage with the new logo.  
Alex: I'll handle gathering feedback from users.  
Also, let's discuss automating the report generation process next week.

**Example Output:**  
[
  "Update Homepage Logo",
  "Collect User Feedback",
  "Discuss Report Automation"
]

(For longer or more complex transcripts, extract each discrete actionable topic as a Jira ticket name using an action verb and clear, concise phrasing.)

# Notes

- Only include tasks specifically referenced or clearly implied as actionable in the transcript.
- Each ticket name should use an action verb and title case.
- Each entry must be 3 to 7 words—no sentences or unnecessary detail.

Persistent Reminder: For each actionable item in the transcript, produce a single Jira ticket-style name (starting with an action verb, 3–7 words, title case), and return ONLY a JSON array of such strings.`;