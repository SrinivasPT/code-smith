# Jira Story Clarification Prompt

## Purpose
This prompt is used to analyze Jira stories and identify clarifications needed to make them ready for development.

## Prompt Template

Analyze the following Jira story and identify clarifications needed to make it ready for development. Focus on missing details, ambiguities, or areas that need more specificity.

**Story Summary:** {{summary}}

**Description:** {{description}}

**Acceptance Criteria:**
{{acceptanceCriteria}}

Please provide 3-5 specific clarification questions that would help a developer understand and implement this story. Each question should be clear and actionable.

Format your response as a JSON array of objects, each with a "question" field and optionally a "context" field explaining why this clarification is needed.

## Example Response Format

```json
[
  {"question": "What is the expected API response format?", "context": "API integration requires clear specifications"},
  {"question": "What authentication method should be used?", "context": "Security requirements need to be defined"}
]
```

## Guidelines

- Focus on technical implementation details
- Ask about missing specifications
- Identify potential edge cases
- Question unclear requirements
- Consider integration points with existing systems
