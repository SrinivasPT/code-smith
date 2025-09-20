/// <reference types="react" />
import React, { useState, useEffect } from "react";
import RefinementPage from "./components/RefinementPage";
import PlanPanel from "./components/PlanPanel";
import JiraDetails from "./components/JiraDetails";
import { JiraProvider, useJira } from "./context/JiraContext";
import JiraFetch from "./components/JiraFetch";

// TypeScript declaration for acquireVsCodeApi
declare global {
	interface Window {
		acquireVsCodeApi: () => {
			postMessage: (msg: any) => void;
			// ...other VS Code API methods if needed
		};
	}
}

// Acquire VS Code API once at module level
const vscode = window.acquireVsCodeApi();

export default function App() {
	return (
		<JiraProvider>
			<InnerApp />
		</JiraProvider>
	);
}

function InnerApp() {
	const jiraCtx = useJira();
	const [showPlanPanel, setShowPlanPanel] = useState(false);
	const [activeButton, setActiveButton] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const [isHandlingRefineResponse, setIsHandlingRefineResponse] = useState(false);

	const { restoreRefined, addClarificationsFromLLM, updateAdditionalContext } = jiraCtx;
	const isAnyLoading = isLoading || jiraCtx.state?.saving || jiraCtx.state?.externalLoading || false;

	useEffect(() => {
		const messageHandler = (event: MessageEvent) => {
			const message = event.data;
			switch (message.type) {
				case "clarifications":
					addClarificationsFromLLM(message.data).catch((error) => {
						console.error("Failed to add clarifications:", error);
						setIsLoading(false); // Clear loading on error
					});
					break;
				case "refine-response":
					handleRefineResponse(message.data).catch((error) => {
						console.error("Failed to handle refine response:", error);
					});
					break;
				case "error":
					console.error("Extension error:", message.message);
					setIsLoading(false); // Clear loading on error
					// You could show a toast or alert here
					alert(`Error: ${message.message}`);
					break;
			}
		};

		window.addEventListener("message", messageHandler);
		return () => window.removeEventListener("message", messageHandler);
	}, [addClarificationsFromLLM, updateAdditionalContext]);

	// Watch for JiraContext saving and external loading states
	useEffect(() => {
		if (jiraCtx.state.saving || jiraCtx.state.externalLoading) {
			setIsLoading(true);
		} else if (!isHandlingRefineResponse) {
			// Only clear loading when JiraContext operations complete AND we're not handling a refine response
			setIsLoading(false);
		}
	}, [jiraCtx.state.saving, jiraCtx.state.externalLoading, isHandlingRefineResponse]);

	const handleRefine = async () => {
		setActiveButton("refine");
		setIsLoading(true);
		setShowPlanPanel(false);
		if (!jiraCtx.state.store) {
			console.error("No Jira store available");
			setIsLoading(false);
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
			setIsLoading(false); // Clear loading on error
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

	const handleClosePlanPanel = () => {
		setShowPlanPanel(false);
	};

	const handleRefineResponse = async (data: { newClarifications: any[]; revisedAdditionalContext: string }) => {
		console.log("handleRefineResponse: starting", data);
		try {
			// Set loading state for the entire operation
			setIsLoading(true);
			setIsHandlingRefineResponse(true);

			// Clear existing clarifications by deleting them all
			if (jiraCtx.state.store?.clarifications) {
				console.log("handleRefineResponse: deleting existing clarifications", jiraCtx.state.store.clarifications.length);
				for (const clarification of jiraCtx.state.store.clarifications) {
					await jiraCtx.deleteClarification(clarification.question);
				}
			}

			// Update additional context with the revised version
			console.log("handleRefineResponse: updating additional context");
			await jiraCtx.updateAdditionalContext(data.revisedAdditionalContext);

			// Add new clarifications if any
			if (data.newClarifications && data.newClarifications.length > 0) {
				console.log("handleRefineResponse: adding new clarifications", data.newClarifications.length);
				await jiraCtx.addClarificationsFromLLM(data.newClarifications);
			}
			console.log("handleRefineResponse: completed");
		} catch (error: any) {
			console.error("Failed to handle refine response:", error);
		} finally {
			// Clear loading state only after all operations complete
			setIsLoading(false);
			setIsHandlingRefineResponse(false);
		}
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8">
				{/* Header Section */}
				<div className="mb-6 animate-fade-in">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-0">Code Smith</h1>
						<div className="ml-6">
							<JiraFetch />
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => {
									setIsLoading(true);
									restoreRefined();
									setActiveButton("restore");
									setTimeout(() => setIsLoading(false), 500); // Small delay for visual feedback
								}}
								className={activeButton === "restore" ? "btn-accent" : "btn-primary"}
								style={{ fontSize: "0.875rem", width: "6rem" }}
								disabled={isAnyLoading}
							>
								Restore
							</button>
							<button
								onClick={handleRefine}
								className={activeButton === "refine" ? "btn-accent" : "btn-primary"}
								style={{ fontSize: "0.875rem", width: "6rem" }}
								disabled={isAnyLoading}
							>
								Refine
							</button>
							<button
								onClick={() => {
									setActiveButton("plan");
									setShowPlanPanel(true);
								}}
								className={activeButton === "plan" ? "btn-accent" : "btn-primary"}
								style={{ fontSize: "0.875rem", width: "6rem" }}
								disabled={isAnyLoading}
							>
								Plan
							</button>
							<button
								onClick={() => {
									setActiveButton("execute");
									// vscode.postMessage({ type: "execute" });
								}}
								className={activeButton === "execute" ? "btn-accent" : "btn-primary"}
								style={{ fontSize: "0.875rem", width: "6rem" }}
								disabled={isAnyLoading}
							>
								Execute
							</button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="animate-slide-in">
					{showPlanPanel ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full compact">
							{/* Left Side: Jira Details */}
							<div className="space-y-4">
								<div className="card p-4">
									<h2 className="text-lg font-semibold mb-3 flex items-center uppercase">Jira Details</h2>
									<JiraDetails />
								</div>
							</div>

							{/* Right Side: Plan Panel */}
							<div className="space-y-4">
								<div className="card p-4">
									<PlanPanel onClose={handleClosePlanPanel} />
								</div>
							</div>
						</div>
					) : (
						<RefinementPage />
					)}
				</div>
			</div>

			{/* Loading Spinner Overlay */}
			{isAnyLoading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-lg">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						<span className="text-gray-700 font-medium">Processing...</span>
					</div>
				</div>
			)}
		</div>
	);
}
