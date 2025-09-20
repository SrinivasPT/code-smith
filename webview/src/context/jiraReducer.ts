import { Draft } from "immer";
import type { JiraStore, Clarification } from "../models/model";
export type State = { store: JiraStore | null; saving?: boolean; externalLoading?: boolean; error?: string | null };

export type Action =
	| { type: "SET_STORE"; store: JiraStore | null }
	| { type: "ADD_CLARIFICATION_LOCAL"; clarification: Clarification }
	| { type: "UPDATE_CLARIFICATION_LOCAL"; question: string; response: string; author?: string }
	| { type: "DELETE_CLARIFICATION_LOCAL"; question: string }
	| { type: "APPLY_REFINEMENT_LOCAL"; modifiedFields: Record<string, any>; author?: string }
	| { type: "UPDATE_FIELD_LOCAL"; field: string; value: any }
	| { type: "UPDATE_ADDITIONAL_CONTEXT_LOCAL"; context: string }
	| { type: "SET_SAVING"; saving: boolean }
	| { type: "SET_EXTERNAL_LOADING"; loading: boolean }
	| { type: "SET_ERROR"; error?: string | null }
	| { type: "RESTORE_REFINED" };

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
		case "UPDATE_CLARIFICATION_LOCAL":
			if (!draft.store) return;
			draft.store.clarifications = draft.store.clarifications || [];
			const existingIndex = draft.store.clarifications.findIndex((c) => c.question === action.question);
			if (existingIndex >= 0) {
				draft.store.clarifications[existingIndex] = {
					...draft.store.clarifications[existingIndex],
					response: action.response,
					author: action.author,
					createdAt: new Date().toISOString(),
				};
			} else {
				// If not found, add as new (fallback)
				const id = Math.random().toString(36).substr(2, 9); // Simple ID for local
				draft.store.clarifications.push({
					id,
					question: action.question,
					response: action.response,
					author: action.author,
					createdAt: new Date().toISOString(),
				});
			}
			return;
		case "DELETE_CLARIFICATION_LOCAL":
			if (!draft.store) return;
			draft.store.clarifications = draft.store.clarifications || [];
			draft.store.clarifications = draft.store.clarifications.filter((c) => c.question !== action.question);
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
		case "SET_EXTERNAL_LOADING":
			draft.externalLoading = action.loading;
			return;
		case "SET_SAVING":
			draft.saving = action.saving;
			return;
		case "UPDATE_FIELD_LOCAL":
			if (!draft.store) return;
			const legacyFields3 = (draft.store as any).fields;
			draft.store.refined =
				draft.store.refined ||
				(legacyFields3
					? { ...legacyFields3 }
					: draft.store.original && draft.store.original.fields
					? { ...draft.store.original.fields }
					: {});
			if (draft.store.refined) {
				draft.store.refined[action.field] = action.value;
			}
			return;
		case "UPDATE_ADDITIONAL_CONTEXT_LOCAL":
			if (!draft.store) return;
			draft.store.additionalContext = action.context;
			return;
		case "RESTORE_REFINED":
			if (!draft.store || !draft.store.original) return;
			draft.store.refined = { ...draft.store.original.fields };
			return;
	}
};

export default jiraReducer;
