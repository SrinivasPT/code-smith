const fs = require("fs");
const path = require("path");
const assert = require("assert");

// Simple template substitution helper
function render(template, vars) {
	return template.replace(/{{\s*(\w+)\s*}}/g, (m, key) => {
		return typeof vars[key] !== "undefined" ? vars[key] : "";
	});
}

function testPrompt(fileName, sampleVars, requiredStrings) {
	const filePath = path.join(__dirname, "..", "src", "prompts", fileName);
	if (!fs.existsSync(filePath)) {
		console.error("Prompt file not found:", filePath);
		process.exit(2);
	}
	const template = fs.readFileSync(filePath, "utf8");
	const rendered = render(template, sampleVars);

	requiredStrings.forEach((s) => {
		assert.ok(rendered.indexOf(s) !== -1, `Rendered prompt must include: ${s}`);
	});
	console.log(`OK: ${fileName}`);
}

try {
	const promptsDir = path.join(__dirname, "..", "src", "prompts");
	const promptFiles = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".md"));

	promptFiles.forEach((fileName) => {
		const baseName = path.basename(fileName, ".md");
		let sampleVars = {};
		let requiredStrings = [];

		if (baseName === "plan-generation-prompt") {
			sampleVars = {
				summary: "Add user login",
				description: "Implement login using OAuth2",
				acceptanceCriteria: "- users can login",
				clarificationsText: "No clarifications",
				additionalContext: "N/A",
				codeContextSection: "",
				previousPlanSection: "",
				userFeedbackSection: "",
			};
			requiredStrings = ["JIRA STORY DETAILS", "INSTRUCTIONS", "RESPONSE FORMAT"];
		} else if (baseName === "clarification-prompt") {
			sampleVars = {
				summary: "Example",
				description: "Example description",
				acceptanceCriteria: "Criteria",
			};
			requiredStrings = ["Analyze the following Jira story", "Please provide 3-5 specific clarification questions"];
		} else {
			// Default for other prompts
			sampleVars = { summary: "Test", description: "Test desc" };
			requiredStrings = ["{{summary}}", "{{description}}"]; // Basic check for placeholders
		}

		testPrompt(fileName, sampleVars, requiredStrings);
	});

	console.log("\nAll prompt tests passed");
} catch (err) {
	console.error(err && err.message ? err.message : err);
	process.exit(1);
}
