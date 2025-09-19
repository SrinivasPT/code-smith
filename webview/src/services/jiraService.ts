// Small utility service for Jira-related helpers

import { v4 as uuidv4 } from "uuid";

import { JiraDetails, JiraRaw, JiraStore, Clarification } from "../models/model";

// Detect runtime. In browser we provide a localStorage-based fallback. In Node (or Electron) we use fs/path.
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

let nodeFs: any = null;
let jiraPath: string | null = null;
if (!isBrowser) {
	// require dynamically so bundlers don't externalize in browser builds
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fs = require("fs");
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const path = require("path");
	nodeFs = fs;
	jiraPath = path.resolve(__dirname, "./jira.json");
}

const RECENT_KEYS = "jira.recent";
const MAX_RECENT_KEYS = 10;

function getRecentKeys(): string[] {
	if (!isBrowser) return [];
	try {
		const raw = localStorage.getItem(RECENT_KEYS);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		return [];
	}
}

function saveRecentKeys(keys: string[]) {
	if (!isBrowser) return;
	try {
		localStorage.setItem(RECENT_KEYS, JSON.stringify(keys));
	} catch (e) {
		console.warn("Failed to save recent keys", e);
	}
}

function addRecentKey(key: string) {
	const recent = getRecentKeys();
	const filtered = recent.filter((k) => k !== key);
	filtered.unshift(key);
	if (filtered.length > MAX_RECENT_KEYS) {
		filtered.splice(MAX_RECENT_KEYS);
	}
	saveRecentKeys(filtered);
}

function removeOldKeys() {
	if (!isBrowser) return;
	const recent = getRecentKeys();
	const allKeys = Object.keys(localStorage);
	const jiraKeys = allKeys.filter((k) => k.startsWith("jira.") && k !== RECENT_KEYS);
	const toRemove = jiraKeys.filter((k) => !recent.includes(k.replace("jira.", "")));
	toRemove.forEach((k) => localStorage.removeItem(k));
}

export async function readStore(key: string): Promise<JiraStore & JiraRaw> {
	if (!key) {
		throw new Error("Key is required for readStore");
	}

	let store: JiraStore & JiraRaw;
	const storageKey = `jira.${key}`;

	if (isBrowser) {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) {
				store = JSON.parse(raw);
				// Ensure the store has the correct key
				store.key = key;
			} else {
				// Not in cache, fetch from API
				const jiraData = await fetchJiraFromApi(key);
				store = {
					key,
					original: jiraData,
					fields: jiraData.fields,
					refined: { ...jiraData.fields }, // Copy API data to refined initially
					clarifications: [],
					meta: { currentVersion: 1, lastModifiedAt: new Date().toISOString() },
					history: [],
				};
				writeStoreAtomic(store, key);
			}
		} catch (e) {
			throw new Error(`Failed to read store for key ${key}: ${e}`);
		}
	} else {
		// Node.js fallback - for now, just return empty (since webview primarily uses localStorage)
		store = { key } as JiraStore & JiraRaw;
	}

	return store;
}

export function writeStoreAtomic(obj: any, key: string) {
	if (!key) {
		throw new Error("Key is required for writeStoreAtomic");
	}

	const storageKey = `jira.${key}`;

	if (isBrowser) {
		try {
			localStorage.setItem(storageKey, JSON.stringify(obj));
			addRecentKey(key);
			removeOldKeys(); // Clean up old keys
		} catch (e) {
			console.warn(`Failed to persist ${storageKey} to localStorage`, e);
		}
		return;
	}

	// Node.js fallback - not implemented for webview
	console.warn("writeStoreAtomic not implemented for Node.js in webview context");
}

export async function fetchJiraFromApi(key: string): Promise<JiraRaw> {
	// Placeholder for API call to fetch JIRA details
	// Replace with actual API endpoint and authentication
	const apiUrl = `http://localhost:3000/jira/${key}`;

	try {
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				Authorization: "Bearer YOUR_API_TOKEN", // Replace with actual auth
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch JIRA issue: ${response.statusText}`);
		}

		const data = await response.json();
		const jiraData: JiraRaw = {
			key: data.key,
			fields: data.fields,
		};

		// Store the fetched data
		const store: JiraStore & JiraRaw = {
			key,
			original: jiraData,
			fields: jiraData.fields,
			refined: { ...jiraData.fields }, // Copy API data to refined initially
			clarifications: [],
			meta: { currentVersion: 1, lastModifiedAt: new Date().toISOString() },
			history: [],
		};
		writeStoreAtomic(store, key);

		return jiraData;
	} catch (error) {
		console.error("Error fetching JIRA from API:", error);
		throw error;
	}
}

export async function getJiraItem(key: string): Promise<JiraDetails> {
	const store = await readStore(key);
	// prefer refined fields when available, else original.fields
	const fields = (store.refined && store.refined) || store.fields || (store.original && store.original.fields) || {};
	const json: JiraRaw = { key: store.key || (store.original && store.original.key) || "", fields };
	return JiraDetails.fromJiraJson(json);
}

export async function getOriginal(key: string): Promise<JiraRaw | undefined> {
	const store = await readStore(key);
	return store.original;
}

export async function getRefined(key: string): Promise<Record<string, any> | undefined> {
	const store = await readStore(key);
	return store.refined;
}

export async function getClarifications(key: string): Promise<Clarification[]> {
	const store = await readStore(key);
	return Array.isArray(store.clarifications) ? store.clarifications : [];
}

export async function saveClarification(
	key: string,
	{
		question,
		response,
		author,
		modifiedFields,
	}: {
		question: string;
		response: string;
		author?: string;
		modifiedFields?: Record<string, any>;
	}
) {
	const store = await readStore(key);
	// Ensure original is set
	if (!store.original) {
		// If the file is in the older shape (key + fields), set original to current
		const original: any = { key: store.key, fields: store.fields };
		store.original = original;
	}

	store.refined =
		store.refined || (store.fields ? { ...store.fields } : store.original && store.original.fields ? { ...store.original.fields } : {});

	// Merge modifiedFields into refined (shallow)
	if (modifiedFields && typeof modifiedFields === "object") {
		for (const k of Object.keys(modifiedFields)) {
			store.refined[k] = modifiedFields[k];
		}
	}

	store.clarifications = Array.isArray(store.clarifications) ? store.clarifications : [];
	const now = new Date().toISOString();
	const id = uuidv4();
	const clarification: Clarification = {
		id,
		question,
		response,
		author,
		createdAt: now,
	};
	store.clarifications.push(clarification);

	// history/meta
	store.meta = store.meta || {};
	const nextVersion = (store.meta.currentVersion || 0) + 1;
	store.meta.currentVersion = nextVersion;
	store.meta.lastModifiedBy = author;
	store.meta.lastModifiedAt = now;
	store.history = store.history || [];
	store.history.push({ version: nextVersion, timestamp: now, refined: { ...(store.refined || {}) } });

	// keep compatibility: also write top-level fields for older codepaths
	store.fields = store.fields || store.refined;

	writeStoreAtomic(store, key);
	return clarification;
}

export function refineJira(key: string, modifiedFields: Record<string, any>, author?: string) {
	return saveClarification(key, { question: "<refinement>", response: "<applied>", author, modifiedFields });
}

// Clean up extraneous whitespace and control characters
export function cleanString(s?: string): string {
	if (!s) return "";
	return s.replace(/[\u0000-\u001F\u007F]+/g, "").trim();
}

// Normalize curly quotes to straight quotes and other small normalizations
export function normalizeQuotes(s?: string): string {
	if (!s) return "";
	return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

// Strip common markdown tokens (very small heuristic)
export function stripMarkdown(s?: string): string {
	if (!s) return "";
	return s
		.replace(/```[\s\S]*?```/g, "") // code blocks
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\*\*(.*?)\*\*/g, "$1")
		.replace(/\*(.*?)\*/g, "$1")
		.replace(/__([^_]+)__/g, "$1")
		.replace(/\[(.*?)\]\([^)]*\)/g, "$1")
		.replace(/^>\s?/gm, "")
		.trim();
}

// Parse acceptance criteria from free text (numbers, dashes, bullets)
export function parseAcceptanceCriteria(raw?: string): string[] {
	if (!raw) return [];
	const cleaned = normalizeQuotes(stripMarkdown(cleanString(raw)));
	const parts = cleaned
		.split(/\r?\n(?=(?:\d+\.\s)|(?:[-–*]\s))/)
		.map((p) => p.replace(/^\s*(?:\d+\.\s|[-–*]\s)?/, "").trim())
		.filter(Boolean);
	return parts.length ? parts : [cleaned];
}

export default {
	getJiraItem,
	fetchJiraFromApi,
	cleanString,
	normalizeQuotes,
	stripMarkdown,
	parseAcceptanceCriteria,
};
