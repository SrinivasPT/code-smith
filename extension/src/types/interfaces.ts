import * as vscode from "vscode";

export interface JiraStoryData {
  summary: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface ClarificationQuestion {
  question: string;
  context?: string;
}

export interface WebviewMessage {
  type: string;
  data?: any;
  message?: string;
}

export interface LLMServiceInterface {
  getClarifications(storyData: JiraStoryData): Promise<ClarificationQuestion[]>;
}

export interface WebviewManagerInterface {
  createWebviewPanel(): vscode.WebviewPanel;
  getWebviewContent(scriptUri: vscode.Uri, cssContent: string): string;
}

export interface CommandHandlerInterface {
  registerCommands(context: vscode.ExtensionContext): void;
}
