import React, { useState } from "react";
import { useJira } from "../context/JiraContext";
import * as jiraService from "../services/jiraService";

export default function JiraFetch() {
	const jiraCtx = useJira();
	const [jiraKey, setJiraKey] = useState<string>("");
	const [fetching, setFetching] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);

	return (
		<div className="flex items-center space-x-2">
			<input
				type="text"
				placeholder="Enter JIRA key (e.g. PROJ-123)"
				value={jiraKey}
				className="border p-1 rounded w-64 text-gray-900 placeholder-gray-500"
				onChange={(e) => {
					setJiraKey(e.target.value);
				}}
			/>
			<button
				onClick={async () => {
					setFetchError(null);
					setFetching(true);
					try {
						await jiraService.fetchJiraFromApi(jiraKey);
						await jiraCtx.setCurrentKey(jiraKey);
					} catch (err: any) {
						setFetchError(String(err?.message || err));
						console.error("Failed to fetch JIRA item", err);
					} finally {
						setFetching(false);
					}
				}}
				className="btn-primary text-sm"
				disabled={fetching}
			>
				{fetching ? "Fetching…" : "Fetch"}
			</button>
			{fetchError && <div className="text-sm text-red-500">{fetchError}</div>}
		</div>
	);
}
