import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
	JiraStoryData,
	ClarificationQuestion,
	LLMServiceInterface,
	RefineResponse,
	PlanGenerationRequest,
	PlanGenerationResponse,
	ExecutionPlan,
	PlanStep,
	ExecuteRequest,
	ExecuteResponse,
} from "../types/interfaces";

export class LLMService implements LLMServiceInterface {
	private promptTemplate: string = "";

	constructor(private extensionPath: string) {
		this.loadPromptTemplate();
	}

	private loadPromptTemplate(): void {
		const promptPath = path.join(this.extensionPath, "src", "prompts", "clarification-prompt.md");
		try {
			const content = fs.readFileSync(promptPath, "utf8");
			// Extract the template part from the markdown
			const templateStart = content.indexOf("Analyze the following Jira story");
			const templateEnd = content.indexOf("## Example Response Format");
			if (templateStart !== -1 && templateEnd !== -1) {
				this.promptTemplate = content.substring(templateStart, templateEnd).trim();
			} else {
				// Fallback to the original prompt
				this.promptTemplate = this.getDefaultPromptTemplate();
			}
		} catch (error) {
			console.warn("Could not load prompt template from file, using default:", error);
			this.promptTemplate = this.getDefaultPromptTemplate();
		}
	}

	private getDefaultPromptTemplate(): string {
		return `Analyze the following Jira story and identify clarifications needed to make it ready for development. Focus on missing details, ambiguities, or areas that need more specificity.

Story Summary: {{summary}}

Description: {{description}}

Acceptance Criteria:
{{acceptanceCriteria}}

Please provide 3-5 specific clarification questions that would help a developer understand and implement this story. Each question should be clear and actionable.

Format your response as a JSON array of objects, each with a "question" field and optionally a "context" field explaining why this clarification is needed.

Example:
[
  {"question": "What is the expected API response format?", "context": "API integration requires clear specifications"},
  {"question": "What authentication method should be used?", "context": "Security requirements need to be defined"}
]`;
	}

	private buildPrompt(data: JiraStoryData): string {
		const acceptanceCriteriaText = data.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");

		return this.promptTemplate
			.replace("{{summary}}", data.summary)
			.replace("{{description}}", data.description)
			.replace("{{acceptanceCriteria}}", acceptanceCriteriaText);
	}

	async getClarifications(data: JiraStoryData): Promise<ClarificationQuestion[]> {
		// Check if language model API is available
		if (!vscode.lm) {
			throw new Error(
				"VS Code Language Model API is not available. Please ensure you have GitHub Copilot Chat or another language model extension installed and enabled."
			);
		}

		// Get available chat models
		const models = await vscode.lm.selectChatModels();
		if (!models || models.length === 0) {
			throw new Error(
				"No language models available. Please install and enable GitHub Copilot Chat or another language model extension."
			);
		}

		// Use the first available model (typically Copilot)
		const model = models[0];
		const prompt = this.buildPrompt(data);

		try {
			const messages = [new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, prompt)];
			const response = await model.sendRequest(messages);

			let content = "";
			for await (const chunk of response.stream) {
				content += this.extractContentFromChunk(chunk);
			}

			if (!content) {
				throw new Error("No response from language model");
			}

			return this.parseResponse(content);
		} catch (error) {
			console.error("Language model error:", error);
			throw new Error(`Failed to get response from language model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async refineWithContext(data: JiraStoryData): Promise<RefineResponse> {
		// Check if language model API is available
		if (!vscode.lm) {
			throw new Error(
				"VS Code Language Model API is not available. Please ensure you have GitHub Copilot Chat or another language model extension installed and enabled."
			);
		}

		// Get available chat models
		let model;
		const gptModels = await vscode.lm.selectChatModels({ family: "gpt-4.1" });
		model = gptModels[0];
		// if (gptModels && gptModels.length > 0) {
		// 	model = gptModels[0];
		// } else {
		// 	const allModels = await vscode.lm.selectChatModels();
		// 	if (!allModels || allModels.length === 0) {
		// 		throw new Error(
		// 			"No language models available. Please install and enable GitHub Copilot Chat or another language model extension."
		// 		);
		// 	}
		// 	model = allModels[0];
		// }

		const prompt = this.buildRefinePrompt(data);

		try {
			const messages = [new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, prompt)];
			const response = await model.sendRequest(messages);

			let content = "";
			for await (const chunk of response.stream) {
				content += this.extractContentFromChunk(chunk);
			}

			if (!content) {
				throw new Error("No response from language model");
			}

			return this.parseRefineResponse(content);
		} catch (error) {
			console.error("Language model error:", error);
			throw new Error(`Failed to get response from language model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private extractContentFromChunk(chunk: any): string {
		// Handle different possible chunk formats
		if (typeof chunk === "string") {
			return chunk;
		} else if (chunk && typeof chunk === "object") {
			// VS Code language model chunks have format: {"$mid":21,"value":"text"}
			if (chunk.value !== undefined) {
				return chunk.value;
			} else if (chunk.content) {
				return chunk.content;
			} else if (chunk.text) {
				return chunk.text;
			} else if (chunk.delta) {
				return chunk.delta;
			} else {
				// Fallback: try to stringify and log for debugging
				console.log("Unknown chunk format:", JSON.stringify(chunk));
				return String(chunk);
			}
		}
		return "";
	}

	private parseResponse(content: string): ClarificationQuestion[] {
		try {
			const clarifications = JSON.parse(content);
			return clarifications;
		} catch (parseError) {
			console.error("Failed to parse LLM response:", content);
			throw new Error("Invalid response format from language model");
		}
	}

	private buildRefinePrompt(data: JiraStoryData): string {
		const acceptanceCriteriaText = data.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = data.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. ${c.question}\n   Answer: ${c.response}`)
			.join("\n\n");

		return `Analyze the following Jira story and refine it based on the provided clarifications. Your task is to:

1. Consolidate the answered clarifications into the additional context as bulleted points
2. If additional context already exists, revise it by incorporating the new clarifications
3. Identify if any new clarifications are needed for remaining ambiguities
4. Return both the revised additional context and any new clarifications needed

**Story Summary:** ${data.summary}

**Description:** ${data.description}

**Acceptance Criteria:**
${acceptanceCriteriaText}

**Existing Clarifications (with answers):**
${clarificationsText || "No answered clarifications yet."}

**Current Additional Context:**
${data.additionalContext || "No additional context provided yet."}

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

If no new clarifications are needed, return an empty array for newClarifications.`;
	}

	private parseRefineResponse(content: string): RefineResponse {
		try {
			const response = JSON.parse(content);
			return {
				revisedAdditionalContext: response.revisedAdditionalContext || "",
				newClarifications: response.newClarifications || [],
			};
		} catch (parseError) {
			console.error("Failed to parse refine response:", content);
			throw new Error("Invalid response format from language model");
		}
	}

	async generateExecutionPlan(request: PlanGenerationRequest): Promise<PlanGenerationResponse> {
		// Check if language model API is available
		if (!vscode.lm) {
			throw new Error(
				"VS Code Language Model API is not available. Please ensure you have GitHub Copilot Chat or another language model extension installed and enabled."
			);
		}

		// Get available chat models
		let model;
		const gptModels = await vscode.lm.selectChatModels({ family: "gpt-4.1" });
		model = gptModels[0];

		const prompt = this.buildPlanGenerationPrompt(request);

		try {
			const messages = [new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, prompt)];
			const response = await model.sendRequest(messages);

			let content = "";
			for await (const chunk of response.stream) {
				content += this.extractContentFromChunk(chunk);
			}

			if (!content) {
				throw new Error("No response from language model");
			}

			return this.parsePlanGenerationResponse(content);
		} catch (error) {
			console.error("Language model error:", error);
			throw new Error(`Failed to get response from language model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private buildPlanGenerationPrompt(request: PlanGenerationRequest): string {
		const { jiraStoryData, codeContext, previousPlan, userFeedback } = request;
		const acceptanceCriteriaText = jiraStoryData.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = jiraStoryData.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. ${c.question}\n   Answer: ${c.response}`)
			.join("\n\n");

		let prompt = `You are an expert software architect and developer. Create a detailed CODE IMPLEMENTATION PLAN for the following Jira story. This plan will be used to generate a comprehensive prompt for GitHub Copilot to implement the actual code changes.

**JIRA STORY DETAILS:**

**Story Summary:** ${jiraStoryData.summary}

**Description:** ${jiraStoryData.description}

**Acceptance Criteria:**
${acceptanceCriteriaText}

**Clarifications (with answers):**
${clarificationsText || "No clarifications available."}

**Additional Context:**
${jiraStoryData.additionalContext || "No additional context provided."}`;

		if (codeContext) {
			prompt += `\n\n**CURRENT CODEBASE CONTEXT:**
${codeContext}`;
		}

		if (previousPlan) {
			prompt += `\n\n**PREVIOUS IMPLEMENTATION PLAN (Version ${previousPlan.version}):**
Title: ${previousPlan.title}
Description: ${previousPlan.description}
Overall Approach: ${previousPlan.overallApproach}

Steps:
${previousPlan.steps
	.map(
		(step, i) => `${i + 1}. ${step.title} (${step.status})
   Files: ${step.fileChanges.join(", ")}
   Details: ${step.description}`
	)
	.join("\n\n")}`;
		}

		if (userFeedback) {
			prompt += `\n\n**USER FEEDBACK ON PREVIOUS PLAN:**
${userFeedback}`;
		}

		prompt += `\n\n**INSTRUCTIONS:**
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
    "version": ${previousPlan ? previousPlan.version + 1 : 1}
  },
  "reasoning": "Explanation of the implementation approach and key technical decisions",
  "implementationNotes": [
    "Important note about implementation approach",
    "Potential challenge or gotcha",
    "Alternative approach consideration"
  ]
}

Make the plan specific, actionable, and focused on code implementation details.`;

		return prompt;
	}

	private parsePlanGenerationResponse(content: string): PlanGenerationResponse {
		try {
			const response = JSON.parse(content);

			// Generate IDs and timestamps for the plan
			const now = new Date().toISOString();
			const planId = `plan-${Date.now()}`;

			const plan: ExecutionPlan = {
				id: planId,
				title: response.plan.title || "Code Implementation Plan",
				description: response.plan.description || "",
				overallApproach: response.plan.overallApproach || "",
				technicalConsiderations: response.plan.technicalConsiderations || [],
				testingStrategy: response.plan.testingStrategy || "",
				steps: response.plan.steps.map((step: any, index: number) => ({
					id: step.id || `step-${index + 1}`,
					title: step.title || `Step ${index + 1}`,
					description: step.description || "",
					fileChanges: step.fileChanges || [],
					codeDetails: step.codeDetails || "",
					estimatedComplexity: step.estimatedComplexity || "medium",
					dependencies: step.dependencies || [],
					priority: step.priority || "medium",
					status: step.status || "not-started",
				})),
				createdAt: now,
				updatedAt: now,
				version: response.plan.version || 1,
			};

			return {
				plan,
				reasoning: response.reasoning || "",
				implementationNotes: response.implementationNotes || [],
			};
		} catch (parseError) {
			console.error("Failed to parse plan generation response:", content);
			throw new Error("Invalid response format from language model");
		}
	}

	async createExecutionPrompt(request: ExecuteRequest): Promise<ExecuteResponse> {
		const { jiraStoryData, executionPlan, additionalInstructions } = request;

		// Create a comprehensive prompt for GitHub Copilot
		const acceptanceCriteriaText = jiraStoryData.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = jiraStoryData.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. Q: ${c.question}\n   A: ${c.response}`)
			.join("\n\n");

		const stepsText = executionPlan.steps
			.map(
				(step, i) =>
					`## Step ${i + 1}: ${step.title}
**Description:** ${step.description}
**Files to modify:** ${step.fileChanges.join(", ")}
**Code Details:** ${step.codeDetails}
**Complexity:** ${step.estimatedComplexity}
**Dependencies:** ${step.dependencies?.join(", ") || "None"}`
			)
			.join("\n\n");

		const prompt = `# GitHub Copilot Implementation Request

## User Story Implementation
Implement the following user story with complete code changes according to the detailed implementation plan.

### Jira Story Details
**Summary:** ${jiraStoryData.summary}

**Description:** ${jiraStoryData.description}

**Acceptance Criteria:**
${acceptanceCriteriaText}

### Clarifications
${clarificationsText || "No clarifications provided."}

### Additional Context
${jiraStoryData.additionalContext || "No additional context provided."}

## Implementation Plan
**Overall Approach:** ${executionPlan.overallApproach}

**Technical Considerations:**
${executionPlan.technicalConsiderations.map((tc) => `- ${tc}`).join("\n")}

**Testing Strategy:** ${executionPlan.testingStrategy}

## Detailed Implementation Steps
${stepsText}

## Instructions for GitHub Copilot
Please implement this user story by following the implementation plan step by step. Ensure:

1. **Complete Implementation**: Implement all steps in the plan
2. **Code Quality**: Write clean, maintainable, and well-documented code
3. **Type Safety**: Ensure proper TypeScript types are used
4. **Error Handling**: Include appropriate error handling
5. **Testing**: Include unit tests as specified in the testing strategy
6. **Consistency**: Follow existing code patterns and conventions
7. **Dependencies**: Respect the step dependencies and implement in the correct order

${additionalInstructions ? `\n## Additional Instructions\n${additionalInstructions}` : ""}

Please implement each step completely before moving to the next one. If you need clarification on any step, refer to the detailed code implementation plan above.`;

		return {
			prompt,
			success: true,
		};
	}
}
