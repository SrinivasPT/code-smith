import React from "react";
import JiraFetch from "./JiraFetch";
import Tabs from "./Tabs";

interface HeaderProps {
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "context", label: "Context" },
		{ id: "jira-details", label: "Jira Details" },
		{ id: "plan", label: "Plan" },
		{ id: "execute", label: "Execute" },
	];

	return (
		<div className="mb-6 animate-fade-in">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl sm:text-4xl font-bold text-primary-800 mb-0">Code Smith</h1>
				<div className="ml-6">
					<JiraFetch />
				</div>
			</div>
			<Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
		</div>
	);
};

export default Header;
