import React from "react";
import { useJira } from "../context/JiraContext";

interface PlanPanelProps {
	onClose?: () => void;
}

export default function PlanPanel({ onClose }: PlanPanelProps) {
	const jiraCtx = useJira();
	const store = jiraCtx.state?.store;

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

	return (
		<div className="space-y-3 compact">
			{/* Additional Context */}
			{additionalContext && (
				<div className="p-4 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
					<h3 className="font-semibold text-gray-900 mb-3">Additional Context</h3>
					<p className="text-sm text-gray-800 whitespace-pre-wrap">{additionalContext}</p>
				</div>
			)}

			{/* Main Execution Plan Textarea */}
			<div className="p-4 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
				<h3 className="font-semibold text-gray-900 mb-3">Execution Plan</h3>
				<textarea
					className="w-full p-3 border rounded text-sm text-gray-800 resize-vertical"
					rows={12}
					placeholder="Enter your execution plan here..."
					style={{ borderColor: "var(--border)" }}
				/>
			</div>
		</div>
	);
}
