import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { JiraStoryData, ClarificationQuestion, LLMServiceInterface } from "../types/interfaces";

export class LLMService implements LLMServiceInterface {
  private promptTemplate: string = "";

  constructor(private extensionPath: string) {
    this.loadPromptTemplate();
  }

  private loadPromptTemplate(): void {
    const promptPath = path.join(this.extensionPath, "src", "prompts", "clarification-prompt.md");
    try {
      const content = fs.readFileSync(promptPath, "utf8");
      // Extract the template part from the markdown
      const templateStart = content.indexOf("Analyze the following Jira story");
      const templateEnd = content.indexOf("## Example Response Format");
      if (templateStart !== -1 && templateEnd !== -1) {
        this.promptTemplate = content.substring(templateStart, templateEnd).trim();
      } else {
        // Fallback to the original prompt
        this.promptTemplate = this.getDefaultPromptTemplate();
      }
    } catch (error) {
      console.warn("Could not load prompt template from file, using default:", error);
      this.promptTemplate = this.getDefaultPromptTemplate();
    }
  }

  private getDefaultPromptTemplate(): string {
    return `Analyze the following Jira story and identify clarifications needed to make it ready for development. Focus on missing details, ambiguities, or areas that need more specificity.

Story Summary: {{summary}}

Description: {{description}}

Acceptance Criteria:
{{acceptanceCriteria}}

Please provide 3-5 specific clarification questions that would help a developer understand and implement this story. Each question should be clear and actionable.

Format your response as a JSON array of objects, each with a "question" field and optionally a "context" field explaining why this clarification is needed.

Example:
[
  {"question": "What is the expected API response format?", "context": "API integration requires clear specifications"},
  {"question": "What authentication method should be used?", "context": "Security requirements need to be defined"}
]`;
  }

  private buildPrompt(data: JiraStoryData): string {
    const acceptanceCriteriaText = data.acceptanceCriteria
      .map((ac, i) => `${i + 1}. ${ac}`)
      .join('\n');

    return this.promptTemplate
      .replace('{{summary}}', data.summary)
      .replace('{{description}}', data.description)
      .replace('{{acceptanceCriteria}}', acceptanceCriteriaText);
  }

  async getClarifications(data: JiraStoryData): Promise<ClarificationQuestion[]> {
    // Check if language model API is available
    if (!vscode.lm) {
      throw new Error("VS Code Language Model API is not available. Please ensure you have GitHub Copilot Chat or another language model extension installed and enabled.");
    }

    // Get available chat models
    const models = await vscode.lm.selectChatModels();
    if (!models || models.length === 0) {
      throw new Error("No language models available. Please install and enable GitHub Copilot Chat or another language model extension.");
    }

    // Use the first available model (typically Copilot)
    const model = models[0];
    const prompt = this.buildPrompt(data);

    try {
      const messages = [new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, prompt)];
      const response = await model.sendRequest(messages);

      let content = '';
      for await (const chunk of response.stream) {
        content += this.extractContentFromChunk(chunk);
      }

      if (!content) {
        throw new Error("No response from language model");
      }

      return this.parseResponse(content);
    } catch (error) {
      console.error("Language model error:", error);
      throw new Error(`Failed to get response from language model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractContentFromChunk(chunk: any): string {
    // Handle different possible chunk formats
    if (typeof chunk === 'string') {
      return chunk;
    } else if (chunk && typeof chunk === 'object') {
      // VS Code language model chunks have format: {"$mid":21,"value":"text"}
      if (chunk.value !== undefined) {
        return chunk.value;
      } else if (chunk.content) {
        return chunk.content;
      } else if (chunk.text) {
        return chunk.text;
      } else if (chunk.delta) {
        return chunk.delta;
      } else {
        // Fallback: try to stringify and log for debugging
        console.log("Unknown chunk format:", JSON.stringify(chunk));
        return String(chunk);
      }
    }
    return '';
  }

  private parseResponse(content: string): ClarificationQuestion[] {
    try {
      const clarifications = JSON.parse(content);
      return clarifications;
    } catch (parseError) {
      console.error("Failed to parse LLM response:", content);
      throw new Error("Invalid response format from language model");
    }
  }
}
