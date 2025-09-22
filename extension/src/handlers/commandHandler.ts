import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
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
			case "getDocumentation":
				await this.handleGetDocumentationMessage(message);
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

	private async handleGetDocumentationMessage(message: WebviewMessage): Promise<void> {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				this.webviewManager?.postMessage({
					type: "documentation",
					id: message.id,
					data: {
						copilotInstructions: "# No workspace available\nUnable to load documentation.",
						customInstructions: "# No workspace available\nUnable to load documentation.",
						architecture: "# No workspace available\nUnable to load documentation.",
					},
				});
				return;
			}

			const workspaceRoot = workspaceFolders[0].uri.fsPath;

			// Read copilot instructions
			let copilotInstructions = "# Copilot Instructions\n\nFile not found or could not be read.";
			try {
				const copilotPath = path.join(workspaceRoot, ".github", "copilot-instructions.md");
				if (await this.fileExists(copilotPath)) {
					copilotInstructions = await fs.promises.readFile(copilotPath, "utf8");
				}
			} catch (error) {
				console.warn("Failed to read copilot-instructions.md:", error);
			}

			// Read custom instructions (combine all files in .github/instructions/)
			let customInstructions = "# Custom Instructions\n\nNo custom instructions found.";
			try {
				const instructionsDir = path.join(workspaceRoot, ".github", "instructions");
				if (await this.fileExists(instructionsDir)) {
					const files = await fs.promises.readdir(instructionsDir);
					const mdFiles = files.filter((f) => f.endsWith(".md"));
					if (mdFiles.length > 0) {
						const contents = await Promise.all(
							mdFiles.map(async (file) => {
								const filePath = path.join(instructionsDir, file);
								const content = await fs.promises.readFile(filePath, "utf8");
								return `## ${file.replace(".md", "")}\n\n${content}`;
							})
						);
						customInstructions = "# Custom Instructions\n\n" + contents.join("\n\n---\n\n");
					}
				}
			} catch (error) {
				console.warn("Failed to read custom instructions:", error);
			}

			// Read architecture documentation
			let architecture = "# Architecture Documentation\n\nFile not found or could not be read.";
			try {
				const architecturePath = path.join(workspaceRoot, "doc", "architecture.md");
				if (await this.fileExists(architecturePath)) {
					architecture = await fs.promises.readFile(architecturePath, "utf8");
				}
			} catch (error) {
				console.warn("Failed to read architecture.md:", error);
			}

			this.webviewManager?.postMessage({
				type: "documentation",
				id: message.id,
				data: {
					copilotInstructions,
					customInstructions,
					architecture,
				},
			});
		} catch (error) {
			console.error("Failed to get documentation:", error);
			this.webviewManager?.postMessage({
				type: "documentation",
				id: message.id,
				error: error instanceof Error ? error.message : "Failed to load documentation",
			});
		}
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.promises.access(filePath);
			return true;
		} catch {
			return false;
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
