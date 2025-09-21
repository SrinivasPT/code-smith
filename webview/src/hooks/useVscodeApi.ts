// TypeScript declaration for acquireVsCodeApi
declare global {
	interface Window {
		acquireVsCodeApi: () => {
			postMessage: (msg: any) => void;
			// ...other VS Code API methods if needed
		};
	}
}

// Acquire VS Code API once at module level
const vscode = window.acquireVsCodeApi();

// Store it globally so other modules can access it
(window as any).__vscode = vscode;
(globalThis as any).__vscode = vscode;

export const useVscodeApi = () => {
	return vscode;
};
