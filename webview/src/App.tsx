/// <reference types="react" />
import React from "react";
import RefinementPage from "./components/RefinementPage";

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
	const handleClick = () => {
		vscode.postMessage({ type: "refine" });
	};

	return (
			<div className="min-h-screen">
				<div className="container mx-auto px-6 py-8">
				{/* Header Section */}
						<div className="text-center mb-6 animate-fade-in">
							<h1 className="text-4xl font-bold text-gray-900 mb-1">
								🚀 CodeSmith
							</h1>
							<p className="text-muted text-sm max-w-2xl mx-auto">
								Transform Jira stories into executable development plans with AI-powered refinement
							</p>
						</div>

				{/* Main Content */}
				<div className="animate-slide-in">
					<RefinementPage />
				</div>

				{/* Action Button */}
						<div className="text-center mt-8">
							<button
								onClick={handleClick}
								className="btn-accent text-sm px-6 py-2 transform hover:scale-102 transition-transform duration-150"
							>
								✨ Refine Jira Story
							</button>
						</div>
			</div>
		</div>
	);
}
