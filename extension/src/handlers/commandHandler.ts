import * as vscode from "vscode";
import { CommandHandlerInterface, WebviewMessage, JiraStoryData, PlanGenerationRequest } from "../types/interfaces";
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
		console.log("Received webview message:", message.type, message.id);
		switch (message.type) {
			case "refine":
				await this.handleRefineMessage(message.data as JiraStoryData);
				break;
			case "generatePlan":
				console.log("Handling generatePlan message");
				await this.handleGeneratePlanMessage(message);
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

	private async handleGeneratePlanMessage(message: WebviewMessage): Promise<void> {
		console.log("Starting plan generation...");
		try {
			const request: PlanGenerationRequest = {
				jiraStoryData: message.data.jiraStoryData,
				codeContext: await this.getCodeContext(),
				previousPlan: message.data.previousPlan,
				userFeedback: message.data.userFeedback,
			};

			console.log("Calling LLM service for plan generation");
			const planResponse = await this.llmService.generateExecutionPlan(request);

			console.log("Plan generated successfully, sending response");
			this.webviewManager?.postMessage({
				type: "planGenerated",
				id: message.id,
				data: planResponse,
			});
		} catch (error) {
			console.error("Failed to generate plan:", error);
			this.webviewManager?.postMessage({
				type: "planGenerated",
				id: message.id,
				error: error instanceof Error ? error.message : "Failed to generate execution plan",
			});
		}
	}

	private async getCodeContext(): Promise<string> {
		// Get current workspace context for better plan generation
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				return "No workspace available";
			}

			// Get basic workspace information
			const workspaceRoot = workspaceFolders[0].uri.fsPath;
			const files = await vscode.workspace.findFiles(
				"{**/*.ts,**/*.js,**/*.tsx,**/*.jsx,**/*.py,**/*.java,**/*.cs,package.json,README.md}",
				"**/node_modules/**",
				20
			);

			let context = `Workspace: ${workspaceRoot}\n\nKey files found:\n`;

			for (const file of files.slice(0, 10)) {
				// Limit to first 10 files
				const relativePath = vscode.workspace.asRelativePath(file);
				context += `- ${relativePath}\n`;
			}

			// Get the current active file content if available
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const activeFile = vscode.workspace.asRelativePath(activeEditor.document.uri);
				const content = activeEditor.document.getText();
				if (content.length < 2000) {
					// Only include if reasonably sized
					context += `\nActive file (${activeFile}):\n${content}`;
				} else {
					context += `\nActive file: ${activeFile} (${content.length} characters - too large to include)`;
				}
			}

			return context;
		} catch (error) {
			console.error("Failed to get code context:", error);
			return "Unable to gather code context";
		}
	}
}
