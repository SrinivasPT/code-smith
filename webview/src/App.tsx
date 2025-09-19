/// <reference types="react" />
import React from "react";
import RefinementPage from "./components/RefinementPage";
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

	const handleClick = () => {
		// vscode.postMessage({ type: "refine" });
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
							<button className="btn-primary text-sm w-24">Refine</button>
							<button className="btn-primary text-sm w-24">Plan</button>
							<button className="btn-primary text-sm w-24">Execute</button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="animate-slide-in">
					<RefinementPage />
				</div>
			</div>
		</div>
	);
}
