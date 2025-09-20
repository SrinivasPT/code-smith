import React, { useState } from "react";
import { useJira } from "../context/JiraContext";
import Icon from "./Icon";

export default function ClarificationCard({
	question,
	answer,
	onChange,
	onDelete,
}: {
	question: string;
	answer: string;
	onChange: (val: string) => void;
	onDelete?: () => void;
}) {
	const jiraCtx = useJira();
	const isLoading = jiraCtx.state?.saving || jiraCtx.state?.externalLoading || false;
	const [open, setOpen] = useState(true);
	const [isFocused, setIsFocused] = useState(false);

	const hasAnswer = answer.trim().length > 0;

	return (
		<div className={`card overflow-hidden transition-all duration-300 ${open ? "ring-2" : ""} ${hasAnswer ? "border-accent-500" : ""}`}>
			<div className="p-3 cursor-pointer transition-colors duration-150" onClick={() => setOpen(!open)}>
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-3">
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
								hasAnswer ? "bg-[var(--muted)] text-white" : "bg-secondary-600 text-secondary-300"
							}`}
						>
							{hasAnswer ? <Icon name="check" size={14} /> : <Icon name="question" size={14} />}
						</div>
						<span className="font-medium text-secondary-100">{question}</span>
					</div>
					<div className="flex items-center space-x-2">
						{hasAnswer && <span className="text-xs bg-[var(--muted)] text-white px-2 py-1 rounded-full">Answered</span>}
						{onDelete && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
								className="text-red-500 hover:text-red-700 cursor-pointer p-1 bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed"
								title="Delete clarification"
								disabled={isLoading}
							>
								<Icon name="trash" size={16} />
							</button>
						)}
						<Icon
							name="chevron-down"
							size={12}
							className={`transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}
						/>
					</div>
				</div>
			</div>

			<div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
				<div className="p-3 pt-0">
					<textarea
						className="input-field w-full resize-none disabled:opacity-50 disabled:cursor-not-allowed"
						rows={10}
						placeholder="Provide your answer here..."
						value={answer}
						onChange={(e) => onChange(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						disabled={isLoading}
					/>
					<div className="flex justify-between items-center mt-2">
						<span className="text-xs text-muted">{answer.length} characters</span>
						{isFocused && <span className="text-xs text-accent animate-pulse">Press Enter to save</span>}
					</div>
				</div>
			</div>
		</div>
	);
}
