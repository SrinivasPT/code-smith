import {
	JiraStoryData,
	ClarificationQuestion,
	LLMServiceInterface,
	RefineResponse,
	PlanGenerationRequest,
	PlanGenerationResponse,
	ExecuteRequest,
	ExecuteResponse,
} from "../types/interfaces";
import { ClarificationService } from "./ClarificationService";
import { RefineService } from "./RefineService";
import { PlanGenerationService } from "./PlanGenerationService";
import { ExecutionService } from "./ExecutionService";

export class LLMService implements LLMServiceInterface {
	private clarificationService: ClarificationService;
	private refineService: RefineService;
	private planGenerationService: PlanGenerationService;
	private executionService: ExecutionService;

	constructor(private extensionPath: string) {
		this.clarificationService = new ClarificationService(extensionPath);
		this.refineService = new RefineService(extensionPath);
		this.planGenerationService = new PlanGenerationService(extensionPath);
		this.executionService = new ExecutionService(extensionPath);
	}

	async getClarifications(data: JiraStoryData): Promise<ClarificationQuestion[]> {
		return this.clarificationService.getClarifications(data);
	}

	async refineWithContext(data: JiraStoryData): Promise<RefineResponse> {
		return this.refineService.refineWithContext(data);
	}

	async generateExecutionPlan(request: PlanGenerationRequest): Promise<PlanGenerationResponse> {
		return this.planGenerationService.generateExecutionPlan(request);
	}

	async createExecutionPrompt(request: ExecuteRequest): Promise<ExecuteResponse> {
		return this.executionService.createExecutionPrompt(request);
	}
}
