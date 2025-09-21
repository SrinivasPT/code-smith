import * as fs from "fs";
import * as path from "path";
import { BaseLLMService } from "./BaseLLMService";
import { PlanGenerationRequest, PlanGenerationResponse, ExecutionPlan, PlanStep } from "../types/interfaces";

export class PlanGenerationService extends BaseLLMService {
	private planGenerationPromptTemplate: string = "";

	constructor(extensionPath: string) {
		super(extensionPath);
		this.loadPlanGenerationPromptTemplate();
	}

	private loadPlanGenerationPromptTemplate(): void {
		const promptPath = path.join(this.extensionPath, "src", "prompts", "plan-generation-prompt.md");
		try {
			this.planGenerationPromptTemplate = fs.readFileSync(promptPath, "utf8").trim();
		} catch (error) {
			throw new Error(`Could not load plan generation prompt template from file: ${error}`);
		}
	}

	private buildPlanGenerationPrompt(request: PlanGenerationRequest): string {
		const { jiraStoryData, codeContext, previousPlan, userFeedback } = request;
		const acceptanceCriteriaText = jiraStoryData.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = jiraStoryData.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. ${c.question}\n   Answer: ${c.response}`)
			.join("\n\n");

		let codeContextSection = "";
		if (codeContext) {
			codeContextSection = `\n\n**CURRENT CODEBASE CONTEXT:**\n${codeContext}`;
		}

		let previousPlanSection = "";
		if (previousPlan) {
			previousPlanSection = `\n\n**PREVIOUS IMPLEMENTATION PLAN (Version ${previousPlan.version}):**\nTitle: ${
				previousPlan.title
			}\nDescription: ${previousPlan.description}\nOverall Approach: ${previousPlan.overallApproach}\n\nSteps:\n${previousPlan.steps
				.map(
					(step, i) =>
						`${i + 1}. ${step.title} (${step.status})\n   Files: ${step.fileChanges.join(", ")}\n   Details: ${
							step.description
						}`
				)
				.join("\n\n")}`;
		}

		let userFeedbackSection = "";
		if (userFeedback) {
			userFeedbackSection = `\n\n**USER FEEDBACK ON PREVIOUS PLAN:**\n${userFeedback}`;
		}

		const version = previousPlan ? previousPlan.version + 1 : 1;

		return this.planGenerationPromptTemplate
			.replace("{{summary}}", jiraStoryData.summary)
			.replace("{{description}}", jiraStoryData.description)
			.replace("{{acceptanceCriteria}}", acceptanceCriteriaText)
			.replace("{{clarificationsText}}", clarificationsText || "No clarifications available.")
			.replace("{{additionalContext}}", jiraStoryData.additionalContext || "No additional context provided.")
			.replace("{{codeContextSection}}", codeContextSection)
			.replace("{{previousPlanSection}}", previousPlanSection)
			.replace("{{userFeedbackSection}}", userFeedbackSection)
			.replace("{{version}}", version.toString());
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

	async generateExecutionPlan(request: PlanGenerationRequest): Promise<PlanGenerationResponse> {
		const model = await this.getGPTModel();
		const prompt = this.buildPlanGenerationPrompt(request);
		const content = await this.sendRequest(model, prompt);
		return this.parsePlanGenerationResponse(content);
	}
}
