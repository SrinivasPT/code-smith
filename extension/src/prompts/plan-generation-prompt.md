You are an expert software architect and developer. Create a detailed CODE IMPLEMENTATION PLAN for the following Jira story. This plan will be used to generate a comprehensive prompt for GitHub Copilot to implement the actual code changes.

**JIRA STORY DETAILS:**

**Story Summary:** {{summary}}

**Description:** {{description}}

**Acceptance Criteria:**
{{acceptanceCriteria}}

**Clarifications (with answers):**
{{clarificationsText}}

**Additional Context:**
{{additionalContext}}

{{codeContextSection}}

{{previousPlanSection}}

{{userFeedbackSection}}

**INSTRUCTIONS:**
Create a comprehensive CODE IMPLEMENTATION PLAN that breaks down the story into specific code changes. Focus on:

1. **Specific File Changes**: Identify exactly which files need to be created, modified, or deleted
2. **Code Implementation Details**: Describe what code needs to be written in each file
3. **Technical Approach**: Explain the overall implementation strategy
4. **Dependencies**: Identify the order in which changes should be made
5. **Testing Strategy**: Include unit tests, integration tests, and manual testing steps
6. **Implementation Complexity**: Rate each step's complexity (low/medium/high)

The goal is to create a plan detailed enough that GitHub Copilot can implement the complete feature with minimal ambiguity.

**RESPONSE FORMAT:**
Provide your response as a JSON object with the following structure:

{
"plan": {
"title": "Implementation Plan: [Feature Name]",
"description": "Brief description of what will be implemented",
"overallApproach": "Detailed explanation of the implementation strategy",
"steps": [
{
"id": "step-1",
"title": "Step title (e.g., 'Create User Model')",
"description": "Detailed description of what code needs to be implemented",
"fileChanges": [
"src/models/User.ts",
"src/types/UserTypes.ts"
],
"codeDetails": "Specific details about the code to be written - interfaces, functions, classes, etc.",
"estimatedComplexity": "low|medium|high",
"dependencies": ["step-0"],
"priority": "high|medium|low",
"status": "not-started"
}
],
"technicalConsiderations": [
"Important technical consideration 1",
"Performance consideration",
"Security consideration"
],
"testingStrategy": "Description of how to test the implementation",
"version": {{version}}
},
"reasoning": "Explanation of the implementation approach and key technical decisions",
"implementationNotes": [
"Important note about implementation approach",
"Potential challenge or gotcha",
"Alternative approach consideration"
]
}

Make the plan specific, actionable, and focused on code implementation details.
