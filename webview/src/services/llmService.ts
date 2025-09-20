// LLM Service for handling AI-powered clarifications and refinements

import { Clarification } from "../models/model";

// Note: VS Code API is already acquired in App.tsx, so we'll access it via a different method

export interface ClarificationSuggestion {
	question: string;
	context?: string;
	priority?: "high" | "medium" | "low";
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

export interface PlanGenerationResponse {
	plan: ExecutionPlan;
	reasoning: string;
	implementationNotes: string[];
}

/**
 * Identifies clarifications needed for a JIRA story based on its content
 * For now, this returns dummy clarifications. In the future, this could
 * integrate with an actual LLM API.
 */
export async function identifyClarificationsNeeded(
	storySummary: string,
	storyDescription: string,
	acceptanceCriteria: string[]
): Promise<ClarificationSuggestion[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Generate dummy clarifications based on story content
	const clarifications: ClarificationSuggestion[] = [];

	// Always add some basic clarifications
	clarifications.push({
		question: "What are the acceptance criteria for this story?",
		context: "Understanding the requirements is crucial for implementation",
		priority: "high",
	});

	if (storyDescription.toLowerCase().includes("api") || storyDescription.toLowerCase().includes("endpoint")) {
		clarifications.push({
			question: "What is the expected API response format?",
			context: "API integration requires clear specifications",
			priority: "high",
		});
	}

	if (storyDescription.toLowerCase().includes("user") || storyDescription.toLowerCase().includes("login")) {
		clarifications.push({
			question: "What authentication method should be used?",
			context: "Security requirements need to be defined",
			priority: "medium",
		});
	}

	if (storyDescription.toLowerCase().includes("database") || storyDescription.toLowerCase().includes("data")) {
		clarifications.push({
			question: "What data validation rules apply?",
			context: "Data integrity is important for the system",
			priority: "medium",
		});
	}

	if (acceptanceCriteria.length === 0) {
		clarifications.push({
			question: "Can you provide detailed acceptance criteria?",
			context: "Acceptance criteria help define when the story is complete",
			priority: "high",
		});
	}

	// Add at least 2-3 clarifications if we don't have enough
	while (clarifications.length < 3) {
		const additionalQuestions = [
			"What are the performance requirements?",
			"Are there any specific error handling requirements?",
			"What dependencies or prerequisites exist?",
			"Who are the stakeholders for this feature?",
			"What testing scenarios should be covered?",
		];

		const randomQuestion = additionalQuestions[Math.floor(Math.random() * additionalQuestions.length)];
		if (!clarifications.some((c) => c.question === randomQuestion)) {
			clarifications.push({
				question: randomQuestion,
				priority: "low",
			});
		}
	}

	return clarifications;
}

/**
 * Converts clarification suggestions to actual clarifications
 * This would typically be called after the LLM service provides suggestions
 */
export function createClarificationsFromSuggestions(
	suggestions: ClarificationSuggestion[],
	author: string = "llm-service"
): Omit<Clarification, "id" | "createdAt">[] {
	return suggestions.map((suggestion) => ({
		question: suggestion.question,
		response: "", // Empty response - user will fill this
		author,
	}));
}

/**
 * Analyzes story content and suggests refinements
 * This could be used to suggest improvements to the story description
 */
export async function suggestStoryRefinements(storySummary: string, storyDescription: string): Promise<string[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const suggestions: string[] = [];

	if (storySummary.length < 10) {
		suggestions.push("Consider making the summary more descriptive");
	}

	if (
		!storyDescription.toLowerCase().includes("who") &&
		!storyDescription.toLowerCase().includes("what") &&
		!storyDescription.toLowerCase().includes("why")
	) {
		suggestions.push("Consider adding context about who, what, and why for this story");
	}

	if (storyDescription.length < 50) {
		suggestions.push("The description could be more detailed to help with implementation");
	}

	return suggestions;
}

export default {
	identifyClarificationsNeeded,
	createClarificationsFromSuggestions,
	suggestStoryRefinements,
};

/**
 * Generates an execution plan based on Jira story data
 * This communicates with the VS Code extension's LLM service
 */
export async function generateExecutionPlan(
	jiraStoryData: {
		summary: string;
		description: string;
		acceptanceCriteria: string[];
		clarifications: any[];
		additionalContext: string;
	},
	previousPlan?: ExecutionPlan,
	userFeedback?: string
): Promise<PlanGenerationResponse> {
	console.log("Starting plan generation...");

	// Access the VS Code API from the global window object (stored by App.tsx)
	const vscode = (window as any).__vscode || (globalThis as any).__vscode;

	if (!vscode) {
		console.error("VS Code API not available - it should be set by App.tsx");
		throw new Error("VS Code API not available");
	}

	console.log("VS Code API available, sending message");

	// Send message to the extension to generate the plan
	return new Promise((resolve, reject) => {
		const messageId = `plan-${Date.now()}`;
		console.log("Generated message ID:", messageId);

		// Listen for the response
		const messageHandler = (event: MessageEvent) => {
			console.log("Received message:", event.data);
			const message = event.data;
			if (message.type === "planGenerated" && message.id === messageId) {
				console.log("Got matching plan response");
				window.removeEventListener("message", messageHandler);
				if (message.error) {
					console.error("Plan generation error:", message.error);
					reject(new Error(message.error));
				} else {
					console.log("Plan generation successful");
					resolve(message.data);
				}
			}
		};

		window.addEventListener("message", messageHandler);

		// Send the request to the extension
		console.log("Sending plan generation request");
		vscode.postMessage({
			type: "generatePlan",
			id: messageId,
			data: {
				jiraStoryData,
				previousPlan,
				userFeedback,
			},
		});

		// Timeout after 30 seconds
		setTimeout(() => {
			console.log("Plan generation timed out");
			window.removeEventListener("message", messageHandler);
			reject(new Error("Plan generation timed out"));
		}, 30000);
	});
}
