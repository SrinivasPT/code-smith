import * as fs from "fs";
import * as path from "path";
import { BaseLLMService } from "./BaseLLMService";
import { JiraStoryData, ClarificationQuestion } from "../types/interfaces";

export class ClarificationService extends BaseLLMService {
	private promptTemplate: string = "";

	constructor(extensionPath: string) {
		super(extensionPath);
		this.loadPromptTemplate();
	}

	private loadPromptTemplate(): void {
		const promptPath = path.join(this.extensionPath, "src", "prompts", "clarification-prompt.md");
		try {
			this.promptTemplate = fs.readFileSync(promptPath, "utf8").trim();
		} catch (error) {
			throw new Error(`Could not load prompt template from file: ${error}`);
		}
	}

	private buildPrompt(data: JiraStoryData): string {
		const acceptanceCriteriaText = data.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n");

		return this.promptTemplate
			.replace("{{summary}}", data.summary)
			.replace("{{description}}", data.description)
			.replace("{{acceptanceCriteria}}", acceptanceCriteriaText);
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

	async getClarifications(data: JiraStoryData): Promise<ClarificationQuestion[]> {
		const model = await this.getModel();
		const prompt = this.buildPrompt(data);
		const content = await this.sendRequest(model, prompt);
		return this.parseResponse(content);
	}
}
