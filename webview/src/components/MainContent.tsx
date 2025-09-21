import React from "react";
import RefinementPage from "./RefinementPage";
import PlanPanel from "./PlanPanel";
import JiraDetails from "./JiraDetails";
import ContextTab from "./ContextTab";
import ExecuteTab from "./ExecuteTab";

interface MainContentProps {
	onClosePlanPanel: () => void;
	activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ onClosePlanPanel, activeTab }) => {
	const renderTabContent = () => {
		switch (activeTab) {
			case "context":
				return <ContextTab />;
			case "jira-details":
				return <RefinementPage />;
			case "plan":
				return (
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
				);
			case "execute":
				return <ExecuteTab />;
			default:
				return <RefinementPage />;
		}
	};

	return <div className="animate-slide-in">{renderTabContent()}</div>;
};

export default MainContent;
