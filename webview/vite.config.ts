import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "../extension/webview/dist",
		assetsDir: "assets",
		emptyOutDir: true,
		cssCodeSplit: false, // Extract all CSS into a single file
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith(".css")) {
						return "assets/index.[hash].css";
					}
					return "assets/[name].[hash][extname]";
				},
			},
		},
		// ...other build options...
	},
	// ...existing config...
});
