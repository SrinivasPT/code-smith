import React, { useState } from "react";
import { useJira } from "../context/JiraContext";

function formatDate(dateStr: string) {
	return dateStr ? dateStr.split("T")[0] : "";
}

export default function JiraDetails() {
	const jiraCtx = useJira();
	const store = jiraCtx.state?.store || null;
	const fields = store?.refined || (store?.original && store.original.fields) || {};

	// Jira fetch moved to App header

	const [detailsOpen, setDetailsOpen] = useState(false);
	const [acOpen, setAcOpen] = useState(false);
	const [descOpen, setDescOpen] = useState(true);

	// Helper functions to get current values from refined fields
	const getDescription = () => fields.description || "";
	const getAcList = () => {
		const acField = fields.customfield_10601;
		return Array.isArray(acField)
			? acField
			: typeof acField === "string"
			? acField
					.split(/\r?\n/)
					.map((s: string) => s.trim())
					.filter(Boolean)
			: [];
	};

	// Helper functions to update refined fields
	const updateDescription = async (value: string) => {
		await jiraCtx.updateField("description", value);
	};

	const updateAcList = async (newAcList: string[]) => {
		await jiraCtx.updateField("customfield_10601", newAcList.join("\n"));
	};

	async function emitChange(newDesc: string | undefined, newAcList: string[] | undefined) {
		const modified: any = {};
		if (newDesc !== undefined) modified.description = newDesc;
		if (Array.isArray(newAcList)) modified.customfield_10601 = newAcList.join("\n");
		try {
			await jiraCtx.refineJira(modified, "local");
		} catch (err) {
			console.error("Failed to persist refinement", err);
		}
	}

	function updateAcAt(index: number, value: string) {
		const currentAcList = getAcList();
		const updated = [...currentAcList];
		updated[index] = value;
		updateAcList(updated);
	}

	function addAc() {
		const currentAcList = getAcList();
		const updated = [...currentAcList, ""];
		updateAcList(updated);
	}

	function removeAc(index: number) {
		const currentAcList = getAcList();
		const updated = currentAcList.filter((_, i) => i !== index);
		updateAcList(updated);
	}

	return (
		<div className="space-y-4">
			{/* Card: Title */}
			<div className="flex items-start justify-between">
				<h2 className="mt-1 text-xl text-gray-900 leading-tight">{fields.summary}</h2>
			</div>

			{/* Card: Description (collapsible) */}
			<div>
				<button
					aria-expanded={descOpen}
					onClick={() => setDescOpen((d) => !d)}
					className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
				>
					<div className="flex items-center justify-between">
						<div className="text-sm font-semibold uppercase">Description</div>
						<div className="text-sm">{descOpen ? "Hide" : "Show"}</div>
					</div>
				</button>

				{descOpen && (
					<div className="mt-2 p-3 bg-white rounded-b-lg border-t-0 border" style={{ borderColor: "var(--border)" }}>
						<div className="text-sm text-gray-800 leading-relaxed">
							<textarea
								value={getDescription()}
								onChange={(e) => {
									const value = e.target.value;
									updateDescription(value);
								}}
								rows={6}
								className="w-full border p-2 rounded"
							/>
							{!getDescription() && <div className="text-gray-400 mt-2">No description provided.</div>}
						</div>
						{/* Additional Context */}
						<div className="mt-4">
							<h3 className="font-semibold text-red-900 mb-2">Additional Context</h3>
							<textarea
								value={jiraCtx.state?.store?.additionalContext || ""}
								onChange={(e) => {
									jiraCtx
										.updateAdditionalContext(e.target.value)
										.catch((e) => console.error("Failed to update additional context", e));
								}}
								className="w-full p-2 border rounded text-sm text-gray-800"
								placeholder="Add any additional context or notes here..."
								rows={5}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Acceptance Criteria (collapsible) */}
			<div className="p-0">
				<button
					aria-expanded={acOpen}
					onClick={() => setAcOpen((v) => !v)}
					className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
				>
					<div className="flex items-center justify-between">
						<div className="text-sm font-semibold uppercase">Acceptance Criteria</div>
						<div className="text-sm">{acOpen ? "Hide" : "Show"}</div>
					</div>
				</button>

				{acOpen && (
					<div className="mt-2 p-3 bg-white rounded-b-lg border-t-0 border" style={{ borderColor: "var(--border)" }}>
						<div>
							{getAcList().length ? (
								<ul className="list-decimal list-inside text-sm text-gray-800 space-y-2">
									{getAcList().map((ac, i) => (
										<li key={i} className="leading-snug flex items-start space-x-2">
											<input
												value={ac}
												onChange={(e) => updateAcAt(i, e.target.value)}
												className="flex-1 border p-1 rounded"
											/>
											<button onClick={() => removeAc(i)} className="ml-2 text-sm text-red-500">
												Remove
											</button>
										</li>
									))}
								</ul>
							) : (
								<div className="text-sm text-gray-500">No acceptance criteria found.</div>
							)}
							<div className="mt-2">
								<button onClick={addAc} className="btn-primary text-sm">
									Add acceptance criteria
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Collapsible Details */}
			<div>
				<button
					aria-expanded={detailsOpen}
					onClick={() => setDetailsOpen((d) => !d)}
					className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
				>
					<div className="flex items-center justify-between">
						<div className="text-sm font-semibold uppercase">Details</div>
						<div className="text-sm">{detailsOpen ? "Hide" : "Show"}</div>
					</div>
				</button>

				{detailsOpen && (
					<div className="mt-2 p-3 bg-white rounded-b-lg border-t-0 border" style={{ borderColor: "var(--border)" }}>
						<div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
							<div>
								<div className="font-semibold text-gray-700">Created</div>
								<div className="text-gray-600">{formatDate(fields.created)}</div>
							</div>
							<div>
								<div className="font-semibold text-gray-700">Updated</div>
								<div className="text-gray-600">{formatDate(fields.updated)}</div>
							</div>
							<div>
								<div className="font-semibold text-gray-700">Priority</div>
								<div className="text-gray-600">{fields.priority?.name || "-"}</div>
							</div>
							<div>
								<div className="font-semibold text-gray-700">Reporter</div>
								<div className="text-gray-600">{fields.reporter?.displayName || fields.creator?.displayName || "-"}</div>
							</div>
							<div className="col-span-2">
								<div className="font-semibold text-gray-700">Components</div>
								<div className="text-gray-600">{(fields.components || []).map((c: any) => c.name).join(", ") || "-"}</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
