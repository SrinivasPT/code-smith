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

	const handleGenerateClarifications = async () => {
		try {
			await jiraCtx.identifyClarificationsNeeded();
		} catch (error) {
			console.error("Failed to generate clarifications:", error);
		}
	};

	return (
		<div className="space-y-3 compact">
			{/* Header with Progress */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold flex items-center text-gray-900">❓ Clarifications</h2>
				<div className="flex items-center space-x-2">
					{clarifications.length === 0 && (
						<button
							onClick={handleGenerateClarifications}
							disabled={jiraCtx.state?.saving}
							className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{jiraCtx.state?.saving ? "Generating..." : "Generate"}
						</button>
					)}
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
						<p>Click "Generate" to analyze the story and create relevant clarification questions.</p>
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

			{/* Summary */}
			{answeredCount > 0 && (
				<div className="mt-4 p-3 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
					<h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
					<ul className="space-y-1 text-sm text-gray-700">
						{clarifications
							.filter((c) => (c.answer || c.response || "").trim().length > 0)
							.map((c, i) => (
								<li key={i} className="flex items-start space-x-2">
									<span className="text-[var(--accent)] mt-0.5">•</span>
									<span>
										<strong>{c.question}</strong>: {c.answer || c.response}
									</span>
								</li>
							))}
					</ul>
				</div>
			)}
		</div>
	);
}
