import * as vscode from "vscode";

export abstract class BaseLLMService {
	constructor(protected extensionPath: string) {}

	protected async getModel(): Promise<vscode.LanguageModelChat> {
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
		return models[0];
	}

	protected async getGPTModel(): Promise<vscode.LanguageModelChat> {
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
		if (!model) {
			const allModels = await vscode.lm.selectChatModels();
			if (!allModels || allModels.length === 0) {
				throw new Error(
					"No language models available. Please install and enable GitHub Copilot Chat or another language model extension."
				);
			}
			model = allModels[0];
		}
		return model;
	}

	protected extractContentFromChunk(chunk: any): string {
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

	protected async sendRequest(model: vscode.LanguageModelChat, prompt: string): Promise<string> {
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

			return content;
		} catch (error) {
			console.error("Language model error:", error);
			throw new Error(`Failed to get response from language model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
