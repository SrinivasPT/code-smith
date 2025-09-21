import * as fs from "fs";
import * as path from "path";
import { BaseLLMService } from "./BaseLLMService";
import { ExecuteRequest, ExecuteResponse } from "../types/interfaces";

export class ExecutionService extends BaseLLMService {
	private executionPromptTemplate: string = "";

	constructor(extensionPath: string) {
		super(extensionPath);
		this.loadExecutionPromptTemplate();
	}

	private loadExecutionPromptTemplate(): void {
		const promptPath = path.join(this.extensionPath, "src", "prompts", "execution-prompt.md");
		try {
			this.executionPromptTemplate = fs.readFileSync(promptPath, "utf8").trim();
		} catch (error) {
			throw new Error(`Could not load execution prompt template from file: ${error}`);
		}
	}

	async createExecutionPrompt(request: ExecuteRequest): Promise<ExecuteResponse> {
		const { jiraStoryData, executionPlan, additionalInstructions } = request;

		const acceptanceCriteriaText = jiraStoryData.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = jiraStoryData.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. Q: ${c.question}\n   A: ${c.response}`)
			.join("\n\n");

		const stepsText = executionPlan.steps
			.map(
				(step, i) =>
					`## Step ${i + 1}: ${step.title}\n**Description:** ${step.description}\n**Files to modify:** ${step.fileChanges.join(
						", "
					)}\n**Code Details:** ${step.codeDetails}\n**Complexity:** ${step.estimatedComplexity}\n**Dependencies:** ${
						step.dependencies?.join(", ") || "None"
					}`
			)
			.join("\n\n");

		const prompt = this.executionPromptTemplate
			.replace("{{summary}}", jiraStoryData.summary)
			.replace("{{description}}", jiraStoryData.description)
			.replace("{{acceptanceCriteria}}", acceptanceCriteriaText)
			.replace("{{clarificationsText}}", clarificationsText || "No clarifications provided.")
			.replace("{{additionalContext}}", jiraStoryData.additionalContext || "No additional context provided.")
			.replace("{{overallApproach}}", executionPlan.overallApproach)
			.replace("{{technicalConsiderations}}", executionPlan.technicalConsiderations.map((tc) => `- ${tc}`).join("\n"))
			.replace("{{testingStrategy}}", executionPlan.testingStrategy)
			.replace("{{stepsText}}", stepsText)
			.replace("{{additionalInstructions}}", additionalInstructions ? `\n## Additional Instructions\n${additionalInstructions}` : "");

		return {
			prompt,
			success: true,
		};
	}
}
