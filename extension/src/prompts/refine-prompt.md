Analyze the following Jira story and refine it based on the provided clarifications. Your task is to:

1. Consolidate the answered clarifications into the additional context as bulleted points
2. If additional context already exists, revise it by incorporating the new clarifications
3. Identify if any new clarifications are needed for remaining ambiguities
4. Return both the revised additional context and any new clarifications needed

**Story Summary:** {{summary}}

**Description:** {{description}}

**Acceptance Criteria:**
{{acceptanceCriteria}}

**Existing Clarifications (with answers):**
{{clarificationsText}}

**Current Additional Context:**
{{additionalContext}}

Please provide a JSON response with the following structure:
{
"revisedAdditionalContext": "The consolidated and revised additional context incorporating all answered clarifications",
"newClarifications": [
{
"question": "New clarification question if needed",
"context": "Why this clarification is needed"
}
]
}

If no new clarifications are needed, return an empty array for newClarifications.
