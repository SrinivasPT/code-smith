import { JiraProvider } from "./context/JiraContext";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { useAppActions } from "./hooks/useAppActions";
import Header from "./components/Header";
import MainContent from "./components/MainContent";

function InnerApp() {
	// Initialize hooks
	useMessageHandler();
	const { activeTab, isLoading, handleRefine, handlePlan, handleExecute, handleRestore, handleClosePlanPanel, handleTabChange } =
		useAppActions();

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8">
				<Header activeTab={activeTab} onTabChange={handleTabChange} />

				<MainContent onClosePlanPanel={handleClosePlanPanel} activeTab={activeTab} />
			</div>

			{/* Loading Spinner Overlay */}
			{isLoading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-lg">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						<span className="text-gray-700 font-medium">Processing...</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default function App() {
	return (
		<JiraProvider>
			<InnerApp />
		</JiraProvider>
	);
}
