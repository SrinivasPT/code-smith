/// <reference types="react" />
import React, { useState } from "react";
import RefinementPage from "./components/RefinementPage";
import PlanPanel from "./components/PlanPanel";
import JiraDetails from "./components/JiraDetails";
import { JiraProvider, useJira } from "./context/JiraContext";
import JiraFetch from "./components/JiraFetch";

// TypeScript declaration for acquireVsCodeApi
declare global {
	interface Window {
		acquireVsCodeApi: () => {
			// postMessage: (msg: any) => void;
			// ...other VS Code API methods if needed
		};
	}
}

// Add this line to acquire the VS Code API
// const vscode = window.acquireVsCodeApi();

export default function App() {
	return (
		<JiraProvider>
			<InnerApp />
		</JiraProvider>
	);
}

function InnerApp() {
	const { restoreRefined } = useJira();
	const [showPlanPanel, setShowPlanPanel] = useState(false);

	const handleRefine = () => {
		setShowPlanPanel(false);
		// vscode.postMessage({ type: "refine" });
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
						<div className="flex items-center space-x-3">
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
