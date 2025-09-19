import React, { createContext, ReactNode } from "react";
import { useImmerReducer } from "use-immer";
import type { JiraStore, Clarification } from "../models/model";
import * as jiraService from "../services/jiraService";
import { v4 as uuidv4 } from "uuid";
import jiraReducer, { State, Action } from "./jiraReducer";

export const JiraContext = createContext<
	| {
			state: State;
			dispatch: React.Dispatch<Action>;
			currentKey: string | null;
			setCurrentKey: (key: string) => Promise<void>;
			saveClarification: (args: {
				question: string;
				response: string;
				author?: string;
				modifiedFields?: Record<string, any>;
			}) => Promise<any>;
			refineJira: (modifiedFields: Record<string, any>, author?: string) => Promise<any>;
			updateField: (field: string, value: any) => Promise<void>;
			reloadStore: () => Promise<void>;
			restoreRefined: () => void;
	  }
	| undefined
>(undefined);

export function JiraProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useImmerReducer(jiraReducer, { store: null, saving: false, error: null });
	const [currentKey, setCurrentKeyState] = React.useState<string | null>(null);

	// bootstrap: load current store if there's a current key
	React.useEffect(() => {
		if (currentKey) {
			(async () => {
				try {
					const s = await jiraService.readStore(currentKey);
					dispatch({ type: "SET_STORE", store: s });
				} catch (err: any) {
					dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
				}
			})();
		} else {
			dispatch({ type: "SET_STORE", store: null });
		}
	}, [dispatch, currentKey]);

	async function setCurrentKey(key: string) {
		setCurrentKeyState(key);
		try {
			const s = await jiraService.readStore(key);
			dispatch({ type: "SET_STORE", store: s });
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
		}
	}

	async function saveClarification(args: { question: string; response: string; author?: string; modifiedFields?: Record<string, any> }) {
		if (!currentKey) throw new Error("No current JIRA key set");
		dispatch({ type: "SET_SAVING", saving: true });
		try {
			// optimistic local update
			const now = new Date().toISOString();
			const id = uuidv4();
			const clar: Clarification = {
				id,
				question: args.question,
				response: args.response,
				author: args.author,
				createdAt: now,
			};
			dispatch({ type: "ADD_CLARIFICATION_LOCAL", clarification: clar });

			const persisted = await jiraService.saveClarification(currentKey, {
				question: args.question,
				response: args.response,
				author: args.author,
				modifiedFields: args.modifiedFields,
			});
			// reload after persist to get canonical IDs/timestamps
			await reloadStore();
			dispatch({ type: "SET_SAVING", saving: false });
			return persisted;
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
			dispatch({ type: "SET_SAVING", saving: false });
			throw err;
		}
	}

	async function refineJira(modifiedFields: Record<string, any>, author?: string) {
		if (!currentKey) throw new Error("No current JIRA key set");
		dispatch({ type: "SET_SAVING", saving: true });
		try {
			dispatch({ type: "APPLY_REFINEMENT_LOCAL", modifiedFields, author });
			const persisted = await jiraService.refineJira(currentKey, modifiedFields, author);
			await reloadStore();
			dispatch({ type: "SET_SAVING", saving: false });
			return persisted;
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
			dispatch({ type: "SET_SAVING", saving: false });
			throw err;
		}
	}

	async function updateField(field: string, value: any) {
		if (!currentKey) throw new Error("No current JIRA key set");
		dispatch({ type: "UPDATE_FIELD_LOCAL", field, value });
		try {
			await jiraService.refineJira(currentKey, { [field]: value }, "local");
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
			throw err;
		}
	}

	async function reloadStore() {
		if (!currentKey) return;
		try {
			const s = await jiraService.readStore(currentKey);
			dispatch({ type: "SET_STORE", store: s });
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", error: String(err?.message || err) });
		}
	}

	function restoreRefined() {
		dispatch({ type: "RESTORE_REFINED" });
	}

	return (
		<JiraContext.Provider
			value={{ state, dispatch, currentKey, setCurrentKey, saveClarification, refineJira, updateField, reloadStore, restoreRefined }}
		>
			{children}
		</JiraContext.Provider>
	);
}

export function useJira() {
	const ctx = React.useContext(JiraContext);
	if (!ctx) throw new Error("useJira must be used inside JiraProvider");
	return ctx;
}

// Small helper hook to mirror PageContext/useFormDetail pattern
export function useJiraDetail() {
	const ctx = React.useContext(JiraContext);
	if (!ctx) throw new Error("useJiraDetail must be used inside JiraProvider");
	return { state: ctx.state, dispatch: ctx.dispatch };
}

export type { State, Action };
