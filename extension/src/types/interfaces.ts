import * as vscode from "vscode";

export interface JiraStoryData {
	summary: string;
	description: string;
	acceptanceCriteria: string[];
	clarifications: ClarificationQuestion[];
	additionalContext: string;
}

export interface ClarificationQuestion {
	question: string;
	context?: string;
	response?: string;
	author?: string;
}

export interface RefineResponse {
	newClarifications: ClarificationQuestion[];
	revisedAdditionalContext: string;
}

export interface WebviewMessage {
	type: string;
	data?: any;
	message?: string;
}

export interface LLMServiceInterface {
	getClarifications(storyData: JiraStoryData): Promise<ClarificationQuestion[]>;
	refineWithContext(storyData: JiraStoryData): Promise<RefineResponse>;
}

export interface WebviewManagerInterface {
	createWebviewPanel(): vscode.WebviewPanel;
	getWebviewContent(scriptUri: vscode.Uri, cssContent: string): string;
}

export interface CommandHandlerInterface {
	registerCommands(context: vscode.ExtensionContext): void;
}
