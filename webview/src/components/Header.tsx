import React from "react";
import JiraFetch from "./JiraFetch";

interface HeaderProps {
	activeButton: string | null;
	isLoading: boolean;
	onRestore: () => void;
	onRefine: () => void;
	onPlan: () => void;
	onExecute: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeButton, isLoading, onRestore, onRefine, onPlan, onExecute }) => {
	return (
		<div className="mb-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-0">Code Smith</h1>
				<div className="ml-6">
					<JiraFetch />
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={onRestore}
						className={activeButton === "restore" ? "btn-accent" : "btn-primary"}
						style={{ fontSize: "0.875rem", width: "6rem" }}
						disabled={isLoading}
					>
						Restore
					</button>
					<button
						onClick={onRefine}
						className={activeButton === "refine" ? "btn-accent" : "btn-primary"}
						style={{ fontSize: "0.875rem", width: "6rem" }}
						disabled={isLoading}
					>
						Refine
					</button>
					<button
						onClick={onPlan}
						className={activeButton === "plan" ? "btn-accent" : "btn-primary"}
						style={{ fontSize: "0.875rem", width: "6rem" }}
						disabled={isLoading}
					>
						Plan
					</button>
					<button
						onClick={onExecute}
						className={activeButton === "execute" ? "btn-accent" : "btn-primary"}
						style={{ fontSize: "0.875rem", width: "6rem" }}
						disabled={isLoading}
					>
						Execute
					</button>
				</div>
			</div>
		</div>
	);
};

export default Header;
