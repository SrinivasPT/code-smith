import React from "react";

interface TabProps {
	id: string;
	label: string;
	active: boolean;
	onClick: (id: string) => void;
	disabled?: boolean;
}

const Tab: React.FC<TabProps> = ({ id, label, active, onClick, disabled = false }) => {
	return (
		<button
			onClick={() => !disabled && onClick(id)}
			className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
				active
					? "bg-white text-primary-600 border-t border-l border-r border-primary-300 shadow-sm"
					: "bg-primary-50 text-primary-700 hover:bg-primary-100 border-t border-l border-r border-transparent"
			} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
			disabled={disabled}
		>
			{label}
		</button>
	);
};

interface TabsProps {
	tabs: { id: string; label: string; disabled?: boolean }[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
	return (
		<div className="flex border-b border-primary-200 bg-primary-50">
			{tabs.map((tab) => (
				<Tab
					key={tab.id}
					id={tab.id}
					label={tab.label}
					active={activeTab === tab.id}
					onClick={onTabChange}
					disabled={tab.disabled}
				/>
			))}
		</div>
	);
};

export default Tabs;
