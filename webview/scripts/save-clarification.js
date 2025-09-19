#!/usr/bin/env node
// Small CLI to append clarification and refine the local jira.json store
// Usage (Windows cmd):
// node scripts\save-clarification.js --question "What about X?" --response "Do Y" --author "Alice" --modified "{\"summary\":\"New summary\"}"

const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const argv = require("minimist")(process.argv.slice(2));

const jiraPath = path.resolve(__dirname, "..", "src", "services", "jira.json");
if (!fs.existsSync(jiraPath)) {
	console.error("jira.json not found at", jiraPath);
	process.exit(1);
}

const question = argv.question || argv.q;
const response = argv.response || argv.r;
const author = argv.author || argv.a || "unknown";
const modifiedRaw = argv.modified || argv.m || null;
if (!question || !response) {
	console.error("--question and --response are required");
	process.exit(1);
}

let modified = {};
if (modifiedRaw) {
	try {
		modified = JSON.parse(modifiedRaw);
	} catch (err) {
		console.error("--modified must be valid JSON", err.message);
		process.exit(1);
	}
}

const raw = fs.readFileSync(jiraPath, "utf8");
const store = JSON.parse(raw);

store.original = store.original || { key: store.key, fields: store.fields };
store.refined =
	store.refined || (store.fields ? { ...store.fields } : store.original && store.original.fields ? { ...store.original.fields } : {});

if (modified && typeof modified === "object") {
	for (const k of Object.keys(modified)) store.refined[k] = modified[k];
}

store.clarifications = Array.isArray(store.clarifications) ? store.clarifications : [];
const now = new Date().toISOString();
const clar = {
	id: uuid.v4(),
	question,
	response,
	author,
	createdAt: now,
	modifiedFields: modified,
	appliedBy: author,
	appliedAt: now,
	refinedSnapshot: { ...(store.refined || {}) },
};
store.clarifications.push(clar);
store.meta = store.meta || {};
const nextVersion = (store.meta.currentVersion || 0) + 1;
store.meta.currentVersion = nextVersion;
store.meta.lastModifiedBy = author;
store.meta.lastModifiedAt = now;
store.history = store.history || [];
store.history.push({ version: nextVersion, timestamp: now, refined: { ...(store.refined || {}) } });
store.fields = store.fields || store.refined;

const tmp = jiraPath + ".tmp";
fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
fs.renameSync(tmp, jiraPath);
console.log("Saved clarification", clar.id);
