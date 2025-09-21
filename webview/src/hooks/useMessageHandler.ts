import { useEffect } from "react";
import { useJira } from "../context/JiraContext";

export const useMessageHandler = () => {
	const { addClarificationsFromLLM, updateAdditionalContext, setLoading, deleteClarification, state } = useJira();

	const handleRefineResponse = async (data: { newClarifications: any[]; revisedAdditionalContext: string }) => {
		console.log("handleRefineResponse: starting", data);
		try {
			// Note: Loading is already set from handleRefine

			// Clear existing clarifications by deleting them all
			if (state.store?.clarifications) {
				console.log("handleRefineResponse: deleting existing clarifications", state.store.clarifications.length);
				for (const clarification of state.store.clarifications) {
					await deleteClarification(clarification.question);
				}
			}

			// Update additional context with the revised version
			console.log("handleRefineResponse: updating additional context");
			await updateAdditionalContext(data.revisedAdditionalContext);

			// Add new clarifications if any
			if (data.newClarifications && data.newClarifications.length > 0) {
				console.log("handleRefineResponse: adding new clarifications", data.newClarifications.length);
				await addClarificationsFromLLM(data.newClarifications);
			}
			console.log("handleRefineResponse: completed");
		} catch (error: any) {
			console.error("Failed to handle refine response:", error);
		} finally {
			// Clear loading state after all operations complete
			setLoading(false);
		}
	};

	useEffect(() => {
		const messageHandler = (event: MessageEvent) => {
			const message = event.data;
			switch (message.type) {
				case "clarifications":
					addClarificationsFromLLM(message.data).catch((error) => {
						console.error("Failed to add clarifications:", error);
						setLoading(false); // Clear loading on error
					});
					break;
				case "refine-response":
					handleRefineResponse(message.data).catch((error) => {
						console.error("Failed to handle refine response:", error);
					});
					break;
				case "error":
					console.error("Extension error:", message.message);
					setLoading(false); // Clear loading on error
					// You could show a toast or alert here
					alert(`Error: ${message.message}`);
					break;
			}
		};

		window.addEventListener("message", messageHandler);
		return () => window.removeEventListener("message", messageHandler);
	}, [addClarificationsFromLLM, updateAdditionalContext, setLoading, deleteClarification]);
};
