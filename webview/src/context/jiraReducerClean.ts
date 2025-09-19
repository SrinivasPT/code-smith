import { Draft } from "immer";
import type { JiraStore, Clarification } from "../models/model";

export type State = { store: JiraStore | null; saving?: boolean; error?: string | null };

export type Action =
	| { type: "SET_STORE"; store: JiraStore | null }
	| { type: "ADD_CLARIFICATION_LOCAL"; clarification: Clarification }
	| { type: "APPLY_REFINEMENT_LOCAL"; modifiedFields: Record<string, any>; author?: string }
	| { type: "SET_SAVING"; saving: boolean }
	| { type: "SET_ERROR"; error?: string | null };

export const jiraReducer = (draft: Draft<State>, action: Action) => {
	switch (action.type) {
		case "SET_STORE":
			draft.store = action.store;
			draft.error = null;
			draft.saving = false;
			return;
		case "ADD_CLARIFICATION_LOCAL":
			if (!draft.store) return;
			draft.store.clarifications = draft.store.clarifications || [];
			draft.store.clarifications.push(action.clarification);
			// also merge into refined
			const legacyFields1 = (draft.store as any).fields;
			draft.store.refined =
				draft.store.refined ||
				(legacyFields1
					? { ...legacyFields1 }
					: draft.store.original && draft.store.original.fields
					? { ...draft.store.original.fields }
					: {});
			return;
		case "APPLY_REFINEMENT_LOCAL":
			if (!draft.store) return;
			const legacyFields2 = (draft.store as any).fields;
			draft.store.refined =
				draft.store.refined ||
				(legacyFields2
					? { ...legacyFields2 }
					: draft.store.original && draft.store.original.fields
					? { ...draft.store.original.fields }
					: {});
			for (const k of Object.keys(action.modifiedFields || {})) {
				// @ts-ignore
				draft.store.refined[k] = action.modifiedFields[k];
			}
			return;
		case "SET_SAVING":
			draft.saving = action.saving;
			return;
		case "SET_ERROR":
			draft.error = action.error ?? null;
			return;
		default:
			return;
	}
};

export default jiraReducer;
