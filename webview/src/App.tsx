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

// Add this line to acquire the VS Code API
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

	const { restoreRefined, addClarificationsFromLLM } = jiraCtx;

	useEffect(() => {
		const messageHandler = (event: MessageEvent) => {
			const message = event.data;
			switch (message.type) {
				case "clarifications":
					addClarificationsFromLLM(message.data).catch((error) => {
						console.error("Failed to add clarifications:", error);
					});
					break;
				case "error":
					console.error("Extension error:", message.message);
					// You could show a toast or alert here
					alert(`Error: ${message.message}`);
					break;
			}
		};

		window.addEventListener("message", messageHandler);
		return () => window.removeEventListener("message", messageHandler);
	}, [addClarificationsFromLLM]);

	const handleRefine = async () => {
		setShowPlanPanel(false);
		if (!jiraCtx.state.store) {
			console.error("No Jira store available");
			return;
		}
		const store = jiraCtx.state.store;
		const summary = store.refined?.summary || store.original?.fields?.summary || "";
		const description = store.refined?.description || store.original?.fields?.description || "";
		const acceptanceCriteria = store.refined?.customfield_10601 || store.original?.fields?.customfield_10601 || [];
		
		vscode.postMessage({
			type: "refine",
			data: {
				summary,
				description,
				acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
			},
		});
	};

	const handlePlan = () => {
		setShowPlanPanel(true);
	};

	const handleExecute = () => {
		// vscode.postMessage({ type: "execute" });
	};

	const handleClosePlanPanel = () => {
		setShowPlanPanel(false);
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
							<button onClick={restoreRefined} className="btn-primary text-sm w-24">
								Restore
							</button>
							<button onClick={handleRefine} className="btn-primary text-sm w-24">
								Refine
							</button>
							<button onClick={handlePlan} className="btn-primary text-sm w-24">
								Plan
							</button>
							<button onClick={handleExecute} className="btn-primary text-sm w-24">
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
		</div>
	);
}
