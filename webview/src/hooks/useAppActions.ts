import { useState } from "react";
import { useJira } from "../context/JiraContext";
import { useVscodeApi } from "./useVscodeApi";

export const useAppActions = () => {
	const jiraCtx = useJira();
	const vscode = useVscodeApi();
	const [showPlanPanel, setShowPlanPanel] = useState(false);
	const [activeButton, setActiveButton] = useState<string | null>(null);

	const { restoreRefined, setLoading } = jiraCtx;
	const isLoading = jiraCtx.state?.loading || false;

	const handleRefine = async () => {
		setActiveButton("refine");
		setLoading(true);
		setShowPlanPanel(false);
		if (!jiraCtx.state.store) {
			console.error("No Jira store available");
			setLoading(false);
			return;
		}
		const store = jiraCtx.state.store;
		const summary = store.refined?.summary || store.original?.fields?.summary || "";
		const description = store.refined?.description || store.original?.fields?.description || "";
		const acceptanceCriteria = store.refined?.customfield_10601 || store.original?.fields?.customfield_10601 || [];
		const clarifications = store.clarifications || [];
		const additionalContext = store.additionalContext || "";

		try {
			// Send message to extension with complete Jira data
			vscode.postMessage({
				type: "refine",
				data: {
					summary,
					description,
					acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
					clarifications,
					additionalContext,
				},
			});
		} catch (error) {
			console.error("Failed to send refine message:", error);
			setLoading(false); // Clear loading on error
		}
		// Note: Don't clear loading here - let handleRefineResponse handle it
	};

	const handlePlan = () => {
		setActiveButton("plan");
		setShowPlanPanel(true);
	};

	const handleExecute = () => {
		setActiveButton("execute");
		// vscode.postMessage({ type: "execute" });
	};

	const handleRestore = () => {
		setLoading(true);
		restoreRefined();
		setActiveButton("restore");
		setTimeout(() => setLoading(false), 500); // Small delay for visual feedback
	};

	const handleClosePlanPanel = () => {
		setShowPlanPanel(false);
	};

	return {
		showPlanPanel,
		activeButton,
		isLoading,
		handleRefine,
		handlePlan,
		handleExecute,
		handleRestore,
		handleClosePlanPanel,
	};
};
