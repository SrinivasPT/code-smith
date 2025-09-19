import React from "react";
import ClarificationCard from "./ClarificationCard";
import { useJira } from "../context/JiraContext";

interface Clarification {
	question: string;
	answer: string;
}

export default function ClarificationsPanel({
	clarifications,
	onUpdate,
}: {
	clarifications?: Clarification[];
	onUpdate?: (index: number, answer: string) => void;
}) {
	const jiraCtx = useJira();

	const ctxClarifications: any[] = jiraCtx.state?.store?.clarifications || [];

	const effectiveClarifications = (clarifications || ctxClarifications).filter((c) => c.question !== "<refinement>");
	const answeredCount = effectiveClarifications.filter((c) => (c.answer || c.response || "").trim().length > 0).length;
	const progressPercentage = (answeredCount / Math.max(1, effectiveClarifications.length)) * 100;

	return (
		<div className="space-y-3 compact">
			{/* Header with Progress */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold flex items-center text-gray-900">❓ Clarifications</h2>
				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted">
						{answeredCount}/{effectiveClarifications.length}
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
				{progressPercentage === 100
					? "🎉 All clarifications completed!"
					: `Answer these ${effectiveClarifications.length} short questions to refine the story.`}
			</div>

			{/* Clarification Cards */}
			<div className="space-y-2">
				{effectiveClarifications.map((c, i) => (
					<div key={i} className="animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
						<ClarificationCard
							question={c.question}
							answer={c.answer || c.response || ""}
							onChange={(val) => {
								if (onUpdate) return onUpdate(i, val);
								// persist via context
								jiraCtx
									.saveClarification({ question: c.question, response: val, author: "local" })
									.catch((e) => console.error("Failed to save clarification", e));
							}}
						/>
					</div>
				))}
			</div>

			{/* Summary */}
			{answeredCount > 0 && (
				<div className="mt-4 p-3 bg-white rounded-lg border" style={{ borderColor: "var(--border)" }}>
					<h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
					<ul className="space-y-1 text-sm text-gray-700">
						{effectiveClarifications
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
