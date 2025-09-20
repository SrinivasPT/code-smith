# CodeSmith Extension - Modular Architecture

This VS Code extension has been refactored into a modular architecture for better maintainability and code organization.

## Project Structure

```
src/
├── extension.ts              # Main entry point - orchestrates modules
├── index.ts                  # Export barrel for clean imports
├── handlers/
│   └── commandHandler.ts     # Command registration and handling
├── managers/
│   └── webviewManager.ts     # Webview creation and management
├── services/
│   └── llmService.ts         # LLM integration and prompt handling
├── types/
│   └── interfaces.ts         # TypeScript interfaces and types
└── prompts/
    └── clarification-prompt.md  # LLM prompt template
```

## Modules

### CommandHandler (`handlers/commandHandler.ts`)
- Registers VS Code commands
- Handles command execution
- Coordinates between webview and services
- Manages application flow

### WebviewManager (`managers/webviewManager.ts`)
- Creates and manages webview panels
- Handles webview content generation
- Manages message passing between extension and webview
- Handles webview lifecycle

### LLMService (`services/llmService.ts`)
- Integrates with VS Code Language Model API
- Loads and processes prompt templates
- Handles LLM communication and response parsing
- Provides clarification generation functionality

### Types (`types/interfaces.ts`)
- Defines TypeScript interfaces for type safety
- Provides contracts for all modules
- Ensures consistent data structures across the extension

### Prompts (`prompts/clarification-prompt.md`)
- Contains LLM prompt templates in markdown format
- Allows easy editing and version control of prompts
- Separates prompt logic from code logic

## Benefits of This Architecture

1. **Separation of Concerns**: Each module has a single responsibility
2. **Testability**: Modules can be unit tested independently
3. **Maintainability**: Changes to one module don't affect others
4. **Reusability**: Modules can be reused across different commands
5. **Type Safety**: Strong TypeScript interfaces ensure consistency
6. **Prompt Management**: Prompts are externalized for easy modification

## Adding New Features

1. **New Commands**: Add to `CommandHandler`
2. **New Services**: Create in `services/` directory
3. **New UI Components**: Extend `WebviewManager`
4. **New Types**: Add to `types/interfaces.ts`
5. **New Prompts**: Add to `prompts/` directory

## Development

Run `npm run compile` to build the extension after making changes.
The TypeScript compiler will validate all module interactions.
