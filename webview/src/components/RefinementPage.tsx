import React from "react";
import JiraDetails from "./JiraDetails";
import ClarificationsPanel from "./ClarificationsPanel";
import ChatPopover from "./ChatPopover";
import { useJira } from "../context/JiraContext";

export default function RefinementPage() {
	const ctx = useJira();

	function handleSave() {
		const toSave = ctx.state?.store || null;
		console.log("Saving Jira store:", toSave);
		// For VS Code extension: postMessage or call backend here
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full compact">
			{/* Left Side: Jira Details */}
			<div className="space-y-4">
				<div className="card p-4">
					<h2 className="text-2xl font-semibold mb-3 flex items-center">Jira Story Details</h2>
					<JiraDetails />
				</div>
			</div>

			{/* Right Side: Clarifications + Chat */}
			<div className="space-y-4">
				<div className="card p-4">
					{/* <div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold flex items-center">Refinement Process</h2>
						<div className="relative">
							<ChatPopover />
						</div>
					</div> */}
					<ClarificationsPanel />
				</div>
			</div>
		</div>
	);
}
