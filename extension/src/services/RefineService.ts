import * as fs from "fs";
import * as path from "path";
import { BaseLLMService } from "./BaseLLMService";
import { JiraStoryData, RefineResponse } from "../types/interfaces";

export class RefineService extends BaseLLMService {
	private refinePromptTemplate: string = "";

	constructor(extensionPath: string) {
		super(extensionPath);
		this.loadRefinePromptTemplate();
	}

	private loadRefinePromptTemplate(): void {
		const promptPath = path.join(this.extensionPath, "src", "prompts", "refine-prompt.md");
		try {
			this.refinePromptTemplate = fs.readFileSync(promptPath, "utf8").trim();
		} catch (error) {
			throw new Error(`Could not load refine prompt template from file: ${error}`);
		}
	}

	private buildRefinePrompt(data: JiraStoryData): string {
		const acceptanceCriteriaText = data.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");
		const clarificationsText = data.clarifications
			.filter((c) => c.response && c.response.trim())
			.map((c, i) => `${i + 1}. ${c.question}\n   Answer: ${c.response}`)
			.join("\n\n");

		return this.refinePromptTemplate
			.replace("{{summary}}", data.summary)
			.replace("{{description}}", data.description)
			.replace("{{acceptanceCriteria}}", acceptanceCriteriaText)
			.replace("{{clarificationsText}}", clarificationsText || "No answered clarifications yet.")
			.replace("{{additionalContext}}", data.additionalContext || "No additional context provided yet.");
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

	async refineWithContext(data: JiraStoryData): Promise<RefineResponse> {
		const model = await this.getGPTModel();
		const prompt = this.buildRefinePrompt(data);
		const content = await this.sendRequest(model, prompt);
		return this.parseRefineResponse(content);
	}
}
