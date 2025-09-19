export interface JiraRaw {
	key: string;
	fields: Record<string, any>;
}

export interface Clarification {
	id: string;
	question: string;
	response: string;
	author?: string;
	createdAt: string;
}

export interface JiraStore {
	original?: JiraRaw;
	refined?: Record<string, any>; // mirrors original.fields shape
	clarifications?: Clarification[];
	history?: Array<{ version: number; timestamp: string; refined: Record<string, any> }>;
	meta?: { currentVersion?: number; lastModifiedBy?: string; lastModifiedAt?: string };
}

export class JiraDetails {
	key: string;
	summary: string;
	description: string;
	acceptanceCriteria: string[];
	assignee?: string;
	created?: string;
	updated?: string;
	status?: string;
	priority?: string;
	components: string[];
	creator?: string;
	clarifications: Clarification[];
	// Keep the raw fields in case something else is needed
	rawFields: Record<string, any>;

	constructor(init: Partial<JiraDetails> = {}) {
		this.key = init.key || "";
		this.summary = init.summary || "";
		this.description = init.description || "";
		this.acceptanceCriteria = init.acceptanceCriteria || [];
		this.assignee = init.assignee;
		this.created = init.created;
		this.updated = init.updated;
		this.status = init.status;
		this.priority = init.priority;
		this.components = init.components || [];
		this.creator = init.creator;
		this.clarifications = init.clarifications || [];
		this.rawFields = init.rawFields || {};
	}

	static fromJiraJson(json: JiraRaw): JiraDetails {
		const f = json.fields || {};
		const acceptanceRaw = f.customfield_10601 || "";
		// Basic split by newlines to form criteria array, keeping formatting for now
		const acceptanceCriteria =
			acceptanceRaw && typeof acceptanceRaw === "string"
				? acceptanceRaw
						.split(/\r?\n/)
						.map((s) => s.trim())
						.filter(Boolean)
				: [];

		return new JiraDetails({
			key: json.key,
			summary: f.summary || "",
			description: f.description || "",
			acceptanceCriteria,
			assignee: f.assignee?.displayName,
			created: f.created,
			updated: f.updated,
			status: f.status?.name,
			priority: f.priority?.name,
			components: (f.components || []).map((c: any) => c.name),
			creator: f.creator?.displayName,
			clarifications: Array.isArray(f.clarifications) ? f.clarifications : [],
			rawFields: f,
		});
	}
}
