import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useVscodeApi } from "../hooks/useVscodeApi";

const ContextTab: React.FC = () => {
	const [activeTab, setActiveTab] = useState("copilot");
	const [documentation, setDocumentation] = useState({
		copilotInstructions: "# Loading...\n\nPlease wait while we load the documentation.",
		customInstructions: "# Loading...\n\nPlease wait while we load the documentation.",
		architecture: "# Loading...\n\nPlease wait while we load the documentation.",
	});
	const vscode = useVscodeApi();

	const tabs = [
		{ id: "copilot", label: "Copilot Instructions" },
		{ id: "custom", label: "Custom Instructions" },
		{ id: "architecture", label: "Architecture" },
	];

	useEffect(() => {
		// Request documentation from the extension
		const messageId = Date.now().toString();
		vscode.postMessage({
			type: "getDocumentation",
			id: messageId,
		});

		// Listen for the response
		const handleMessage = (event: MessageEvent) => {
			const message = event.data;
			if (message.type === "documentation" && message.id === messageId) {
				if (message.error) {
					setDocumentation({
						copilotInstructions: `# Error loading documentation\n\n${message.error}`,
						customInstructions: `# Error loading documentation\n\n${message.error}`,
						architecture: `# Error loading documentation\n\n${message.error}`,
					});
				} else {
					setDocumentation(message.data);
				}
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [vscode]);

	const getContent = () => {
		switch (activeTab) {
			case "copilot":
				return documentation.copilotInstructions;
			case "custom":
				return documentation.customInstructions;
			case "architecture":
				return documentation.architecture;
			default:
				return "";
		}
	};

	return (
		<div className="flex h-full">
			{/* Left sidebar with tabs */}
			<div className="w-64 bg-gray-100 border-r border-gray-200">
				<div className="p-4">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
					<div className="space-y-2">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									activeTab === tab.id
										? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
										: "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Main content area */}
			<div className="flex-1 p-6 overflow-auto">
				<div className="max-w-4xl mx-auto">
					<div className="prose prose-sm max-w-none prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono">
						<ReactMarkdown>{getContent()}</ReactMarkdown>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContextTab;
