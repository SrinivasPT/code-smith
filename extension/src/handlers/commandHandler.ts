import * as vscode from "vscode";
import { CommandHandlerInterface, WebviewMessage, JiraStoryData } from "../types/interfaces";
import { WebviewManager } from "../managers/webviewManager";
import { LLMService } from "../services/llmService";

export class CommandHandler implements CommandHandlerInterface {
	private webviewManager: WebviewManager | undefined;
	private llmService: LLMService;

	constructor(private context: vscode.ExtensionContext) {
		this.llmService = new LLMService(context.extensionPath);
	}

	registerCommands(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.commands.registerCommand("codesmith.open", () => {
				this.handleOpenCommand();
			})
		);
	}

	private handleOpenCommand(): void {
		this.webviewManager = new WebviewManager(this.context, (message: WebviewMessage) => this.handleWebviewMessage(message));

		this.webviewManager.createWebviewPanel();
	}

	private async handleWebviewMessage(message: WebviewMessage): Promise<void> {
		switch (message.type) {
			case "refine":
				await this.handleRefineMessage(message.data as JiraStoryData);
				break;
			default:
				console.warn("Unknown message type:", message.type);
		}
	}

	private async handleRefineMessage(data: JiraStoryData): Promise<void> {
		try {
			const refineResponse = await this.llmService.refineWithContext(data);
			this.webviewManager?.postMessage({
				type: "refine-response",
				data: refineResponse,
			});
		} catch (error) {
			console.error("Failed to refine with context:", error);
			this.webviewManager?.postMessage({
				type: "error",
				message: error instanceof Error ? error.message : "Failed to refine story with LLM",
			});
		}
	}
}
