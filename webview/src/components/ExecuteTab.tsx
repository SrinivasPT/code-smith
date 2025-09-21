import React from "react";

const ExecuteTab: React.FC = () => {
	return (
		<div className="p-8 text-center">
			<div className="max-w-md mx-auto">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">Execute Tab</h2>
				<p className="text-gray-600 mb-6">
					This tab will display the full and final prompt that needs to be given to GitHub Copilot for execution.
				</p>
				<div className="bg-gray-100 rounded-lg p-6">
					<p className="text-sm text-gray-500">Coming Soon...</p>
				</div>
			</div>
		</div>
	);
};

export default ExecuteTab;
