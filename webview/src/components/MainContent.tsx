import React from "react";
import RefinementPage from "./RefinementPage";
import PlanPanel from "./PlanPanel";
import JiraDetails from "./JiraDetails";

interface MainContentProps {
	showPlanPanel: boolean;
	onClosePlanPanel: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ showPlanPanel, onClosePlanPanel }) => {
	return (
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
							<PlanPanel onClose={onClosePlanPanel} />
						</div>
					</div>
				</div>
			) : (
				<RefinementPage />
			)}
		</div>
	);
};

export default MainContent;
