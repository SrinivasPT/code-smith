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
					? "bg-white text-blue-600 border-t border-l border-r border-gray-300"
					: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-t border-l border-r border-transparent"
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
		<div className="flex border-b border-gray-300 bg-gray-50">
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
