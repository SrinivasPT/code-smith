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

export interface PlanStep {
	id: string;
	title: string;
	description: string;
	fileChanges: string[];
	codeDetails: string;
	estimatedComplexity: "low" | "medium" | "high";
	dependencies?: string[];
	priority: "high" | "medium" | "low";
	status: "not-started" | "in-progress" | "completed";
}

export interface ExecutionPlan {
	id: string;
	title: string;
	description: string;
	steps: PlanStep[];
	overallApproach: string;
	technicalConsiderations: string[];
	testingStrategy: string;
	createdAt: string;
	updatedAt: string;
	version: number;
}

export interface PlanGenerationRequest {
	jiraStoryData: JiraStoryData;
	codeContext?: string;
	previousPlan?: ExecutionPlan;
	userFeedback?: string;
}

export interface PlanGenerationResponse {
	plan: ExecutionPlan;
	reasoning: string;
	implementationNotes: string[];
}

export interface ExecuteRequest {
	jiraStoryData: JiraStoryData;
	executionPlan: ExecutionPlan;
	additionalInstructions?: string;
}

export interface ExecuteResponse {
	prompt: string;
	success: boolean;
}

export interface WebviewMessage {
	type: string;
	id?: string;
	data?: any;
	message?: string;
	error?: string;
}

export interface LLMServiceInterface {
	getClarifications(storyData: JiraStoryData): Promise<ClarificationQuestion[]>;
	refineWithContext(storyData: JiraStoryData): Promise<RefineResponse>;
	generateExecutionPlan(request: PlanGenerationRequest): Promise<PlanGenerationResponse>;
	createExecutionPrompt(request: ExecuteRequest): Promise<ExecuteResponse>;
}

export interface WebviewManagerInterface {
	createWebviewPanel(): vscode.WebviewPanel;
	getWebviewContent(scriptUri: vscode.Uri, cssContent: string): string;
}

export interface CommandHandlerInterface {
	registerCommands(context: vscode.ExtensionContext): void;
}
