import React, { useState } from "react";
import { useJira } from "../context/JiraContext";
import { ExecutionPlan, PlanStep } from "../models/model";

interface PlanPanelProps {
	onClose?: () => void;
}

export default function PlanPanel({ onClose }: PlanPanelProps) {
	const jiraCtx = useJira();
	const store = jiraCtx.state?.store as any;
	const [userFeedback, setUserFeedback] = useState("");
	const { setLoading } = jiraCtx;
	const isLoading = jiraCtx.state?.loading || false;

	if (!store) {
		return (
			<div className="space-y-3 compact">
				<div className="text-center py-8">
					<p className="text-muted">No Jira story loaded. Please fetch a story first.</p>
				</div>
			</div>
		);
	}

	const additionalContext = store.additionalContext || "";
	const currentPlan: ExecutionPlan | undefined = store.currentPlan;

	const handleGeneratePlan = async () => {
		setLoading(true);
		try {
			await jiraCtx.generatePlan(userFeedback.trim() || undefined);
			setUserFeedback(""); // Clear feedback after successful generation
		} catch (error) {
			console.error("Failed to generate plan:", error);
			// Error will be shown via the context error state
			setLoading(false);
		}
		// Note: Don't clear loading here - let the context handle it
	};

	const handleStepStatusChange = (stepId: string, status: PlanStep["status"]) => {
		jiraCtx.updatePlanStep(stepId, { status });
	};

	const getPriorityColor = (priority: PlanStep["priority"]) => {
		switch (priority) {
			case "high":
				return "text-red-600 bg-red-50";
			case "medium":
				return "text-yellow-600 bg-yellow-50";
			case "low":
				return "text-green-600 bg-green-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	const getStatusColor = (status: PlanStep["status"]) => {
		switch (status) {
			case "completed":
				return "text-green-600 bg-green-50";
			case "in-progress":
				return "text-blue-600 bg-blue-50";
			case "not-started":
				return "text-gray-600 bg-gray-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	const getComplexityColor = (complexity: PlanStep["estimatedComplexity"]) => {
		switch (complexity) {
			case "high":
				return "text-red-600 bg-red-50";
			case "medium":
				return "text-yellow-600 bg-yellow-50";
			case "low":
				return "text-green-600 bg-green-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	const handleExecutePlan = async () => {
		if (!currentPlan) return;

		try {
			// TODO: Implement execute functionality
			// This would send the plan + Jira story to create a comprehensive prompt for GitHub Copilot
			console.log("Execute plan:", currentPlan);
			alert("Execute functionality will be implemented to generate comprehensive prompt for GitHub Copilot");
		} catch (error) {
			console.error("Failed to execute plan:", error);
		}
	};

	const isPlanComplete = currentPlan && currentPlan.steps.every((step) => step.status === "completed");

	return (
		<div className="space-y-4 compact">
			{/* Additional Context */}
			{additionalContext && (
				<div className="p-4 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
					<h3 className="font-semibold text-gray-900 mb-3">Additional Context</h3>
					<p className="text-sm text-gray-800 whitespace-pre-wrap">{additionalContext}</p>
				</div>
			)}

			{/* Plan Generation Section */}
			<div className="p-4 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
				<div className="flex justify-between items-start mb-3">
					<h3 className="font-semibold text-primary-800">Code Implementation Plan</h3>
					<button
						onClick={handleGeneratePlan}
						disabled={isLoading}
						className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
					>
						{isLoading ? "Generating..." : currentPlan ? "Regenerate Plan" : "Generate Plan"}
					</button>
				</div>

				{/* Feedback Input for Plan Regeneration */}
				{currentPlan && (
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">Feedback for plan improvement (optional):</label>
						<textarea
							value={userFeedback}
							onChange={(e) => setUserFeedback(e.target.value)}
							className="w-full p-3 border rounded text-sm text-gray-800 resize-vertical"
							rows={3}
							placeholder="Provide feedback to improve the plan, e.g., 'Break down the API integration step into smaller tasks' or 'Add more testing considerations'..."
							style={{ borderColor: "var(--border)" }}
						/>
					</div>
				)}

				{/* Error Display */}
				{jiraCtx.state.error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
						<p className="text-sm text-red-700">{jiraCtx.state.error}</p>
					</div>
				)}

				{/* Current Plan Display */}
				{currentPlan ? (
					<div className="space-y-4">
						{/* Plan Header */}
						<div>
							<h4 className="font-medium text-gray-900 mb-2">{currentPlan.title}</h4>
							<p className="text-sm text-gray-600 mb-2">{currentPlan.description}</p>
							<div className="flex gap-4 text-xs text-gray-500">
								<span>Version {currentPlan.version}</span>
								<span>Steps: {currentPlan.steps.length}</span>
								<span>
									Complexity: {currentPlan.steps.filter((s) => s.estimatedComplexity === "high").length} high,{" "}
									{currentPlan.steps.filter((s) => s.estimatedComplexity === "medium").length} medium,{" "}
									{currentPlan.steps.filter((s) => s.estimatedComplexity === "low").length} low
								</span>
							</div>
						</div>

						{/* Plan Steps */}
						<div className="space-y-3">
							{currentPlan.steps.map((step, index) => (
								<div key={step.id} className="border rounded-lg p-3" style={{ borderColor: "var(--border)" }}>
									<div className="flex justify-between items-start mb-2">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="font-medium text-sm">
													{index + 1}. {step.title}
												</span>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
														step.priority
													)}`}
												>
													{step.priority}
												</span>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(
														step.estimatedComplexity
													)}`}
												>
													{step.estimatedComplexity}
												</span>
											</div>
											<p className="text-sm text-gray-600 mb-2">{step.description}</p>
											<div className="text-xs text-gray-500 mb-2">
												<div>
													<strong>Files:</strong> {step.fileChanges.join(", ") || "No files specified"}
												</div>
												<div>
													<strong>Code Details:</strong> {step.codeDetails || "No details provided"}
												</div>
											</div>
											<div className="flex gap-4 text-xs text-gray-500">
												{step.dependencies && step.dependencies.length > 0 && (
													<span>Depends on: {step.dependencies.join(", ")}</span>
												)}
											</div>
										</div>
										<div className="ml-4">
											<select
												value={step.status}
												onChange={(e) => handleStepStatusChange(step.id, e.target.value as PlanStep["status"])}
												className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(step.status)}`}
											>
												<option value="not-started">Not Started</option>
												<option value="in-progress">In Progress</option>
												<option value="completed">Completed</option>
											</select>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Plan Information and Execute Button */}
						{(currentPlan.reasoning ||
							currentPlan.overallApproach ||
							(currentPlan.technicalConsiderations && currentPlan.technicalConsiderations.length > 0)) && (
							<div className="mt-4 p-3 bg-gray-50 rounded-lg">
								{currentPlan.overallApproach && (
									<div className="mb-3">
										<h5 className="font-medium text-sm text-gray-900 mb-1">Overall Approach</h5>
										<p className="text-sm text-gray-700">{currentPlan.overallApproach}</p>
									</div>
								)}
								{currentPlan.reasoning && (
									<div className="mb-3">
										<h5 className="font-medium text-sm text-gray-900 mb-1">Reasoning</h5>
										<p className="text-sm text-gray-700">{currentPlan.reasoning}</p>
									</div>
								)}
								{currentPlan.technicalConsiderations && currentPlan.technicalConsiderations.length > 0 && (
									<div className="mb-3">
										<h5 className="font-medium text-sm text-gray-900 mb-1">Technical Considerations</h5>
										<ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
											{currentPlan.technicalConsiderations.map((consideration, index) => (
												<li key={index}>{consideration}</li>
											))}
										</ul>
									</div>
								)}
								{currentPlan.testingStrategy && (
									<div className="mb-3">
										<h5 className="font-medium text-sm text-gray-900 mb-1">Testing Strategy</h5>
										<p className="text-sm text-gray-700">{currentPlan.testingStrategy}</p>
									</div>
								)}
								{currentPlan.implementationNotes && currentPlan.implementationNotes.length > 0 && (
									<div>
										<h5 className="font-medium text-sm text-gray-900 mb-1">Implementation Notes</h5>
										<ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
											{currentPlan.implementationNotes.map((note, index) => (
												<li key={index}>{note}</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}

						{/* Execute Button */}
						{currentPlan && (
							<div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
								<div className="flex justify-between items-center">
									<div>
										<h5 className="font-medium text-sm text-primary-900 mb-1">Ready to Execute?</h5>
										<p className="text-xs text-primary-700">
											Generate a comprehensive prompt for GitHub Copilot to implement this plan
										</p>
									</div>
									<button
										onClick={handleExecutePlan}
										className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium transition-colors"
									>
										Execute Plan
									</button>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8">
						<p className="text-gray-500 mb-4">No code implementation plan generated yet.</p>
						<p className="text-sm text-gray-400">
							Click "Generate Plan" to create a detailed code implementation plan that can be used with GitHub Copilot.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
