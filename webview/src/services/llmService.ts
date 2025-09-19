// LLM Service for handling AI-powered clarifications and refinements

import { Clarification } from "../models/model";

export interface ClarificationSuggestion {
	question: string;
	context?: string;
	priority?: "high" | "medium" | "low";
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
