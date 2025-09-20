import React, { useState, useEffect } from "react";
import ClarificationCard from "./ClarificationCard";
import { useJira } from "../context/JiraContext";

interface Clarification {
	question: string;
	answer: string;
}

export default function ClarificationsPanel() {
	const jiraCtx = useJira();

	const clarifications: any[] = jiraCtx.state?.store?.clarifications || [];

	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		if (selectedIndex >= clarifications.length && clarifications.length > 0) {
			setSelectedIndex(clarifications.length - 1);
		}
	}, [clarifications.length]);

	// Ensure selectedIndex is always valid
	const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, clarifications.length - 1));

	const answeredCount = clarifications.filter((c) => (c.answer || c.response || "").trim().length > 0).length;
	const progressPercentage = (answeredCount / Math.max(1, clarifications.length)) * 100;

	return (
		<div className="space-y-3 compact">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold flex items-center text-gray-900 uppercase">Clarifications</h2>
				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted">
						{answeredCount}/{clarifications.length}
					</span>
					<div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden">
						<div
							className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Progress Description */}
			<div className="text-sm text-muted mb-3">
				{clarifications.length === 0 ? (
					<div className="text-center py-4">
						<p className="mb-2">No clarifications identified yet.</p>
						<p>Use the "Refine" button to analyze the story and create relevant clarification questions.</p>
					</div>
				) : progressPercentage === 100 ? (
					"🎉 All clarifications completed!"
				) : (
					`Answer these ${clarifications.length} short questions to refine the story.`
				)}
			</div>

			{/* Index Circles */}
			<div className="flex space-x-2 mb-3">
				{clarifications.map((c, i) => (
					<button
						key={i}
						onClick={() => setSelectedIndex(i)}
						className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
							(c.answer || c.response || "").trim().length > 0 ? "bg-green-500" : "bg-red-500"
						} ${i === safeSelectedIndex ? "ring-2 ring-blue-500" : ""}`}
					>
						{i + 1}
					</button>
				))}
			</div>

			{/* Clarification Card */}
			{clarifications.length > 0 && (
				<div className="animate-slide-in">
					<ClarificationCard
						question={clarifications[safeSelectedIndex].question}
						answer={clarifications[safeSelectedIndex].answer || clarifications[safeSelectedIndex].response || ""}
						onChange={(val) => {
							jiraCtx
								.saveClarification({ question: clarifications[safeSelectedIndex].question, response: val, author: "local" })
								.catch((e) => console.error("Failed to save clarification", e));
						}}
						onDelete={() => {
							jiraCtx
								.deleteClarification(clarifications[safeSelectedIndex].question)
								.catch((e) => console.error("Failed to delete clarification", e));
						}}
					/>
				</div>
			)}

			{/* Additional Context */}
			<div className="mt-4 p-3 bg-white rounded-sm border" style={{ borderColor: "var(--border)" }}>
				<h3 className="font-semibold text-gray-900 mb-2 uppercase">Additional Context</h3>
				<textarea
					value={jiraCtx.state?.store?.additionalContext || ""}
					onChange={(e) => {
						jiraCtx
							.updateAdditionalContext(e.target.value)
							.catch((e) => console.error("Failed to update additional context", e));
					}}
					className="w-full p-2 border rounded text-sm text-gray-800"
					placeholder="Add any additional context or notes here..."
					rows={4}
				/>
			</div>
		</div>
	);
}
