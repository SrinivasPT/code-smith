# Project Overview

## Folder Structure

-   `/extension`: Contains VS Code extension code.
-   `/webview`: Contains the source code webview that will be displayed in the VS Code extension panel.

## Libraries and Frameworks

-   React and Tailwind CSS for the webview.

## Purpose and high-level goals

-   This repository contains a Visual Studio Code extension (under `/extension`) and a webview-based companion app (under `/webview`). The goal is to refine Jira stories into code plans and implementations using LLM-driven features (clarifications, plan generation, execution helpers, and refinement flows).

## Detailed folder responsibilities

-   `/extension`

    -   Host for VS Code extension code and activation logic.
    -   Key files:
        -   `src/extension.ts` — extension activation and command registration.
        -   `src/index.ts` — main entry for glue logic.
        -   `src/handlers` — command handlers and message routing.
        -   `src/managers/webviewManager.ts` — controls webview lifecycle and messaging.
        -   `src/services` — LLM-facing services and orchestration (PlanGenerationService, ClarificationService, ExecutionService, RefineService, etc.).
        -   `src/types` — shared TypeScript types and interfaces used across the extension.

-   `/webview`

    -   React + Vite app that runs inside the webview panel. This provides the UI components (tabs, chat, plan and clarification panels) and client-side integration with the extension via the VS Code webview API.
    -   Key areas:
        -   `src/components` — React components used by the UI.
        -   `src/services` — client-side services (e.g., `llmService.ts`, `jiraService.ts`) used to fetch context or call backend endpoints when running outside the extension.
        -   `src/context` and `src/hooks` — app state management and helpers for messaging with the host extension.
    -   Additional files:
        -   `db.json` — Mock data for json-server, used for standalone development.
        -   `scripts/save-clarification.js` — Utility script for saving clarifications.

## Coding guidelines (helpful for Copilot suggestions)

These conventions are used throughout the repo — Copilot should follow them when suggesting changes.

-   Language and typing

    -   Primary languages: TypeScript for both the extension and webview. Prefer strict typing; use interfaces and types in `src/types` where appropriate.
    -   Keep `tsconfig.json` rules in mind: prefer `strict` and avoid `any` unless there's a clear migration note.

-   Patterns and architecture

    -   Separation of concerns: keep extension activation, command handlers, webview management, and LLM orchestration separate.
    -   Services should encapsulate external calls (LLMs, Jira, etc.) and expose small, testable APIs.
    -   Webview UI should be pure React components; side effects belong in hooks or services.

-   Naming and style

    -   Use camelCase for variables and functions, PascalCase for component and type names.
    -   Keep file names aligned with exported symbol names: e.g., `PlanGenerationService.ts` exports `PlanGenerationService`.
    -   Prefer explicit exports (named exports) for most modules; use default exports only for React components when convenient.

-   Comments and documentation

    -   Every exported public function or class should have a short JSDoc comment describing inputs, outputs, and error modes.
    -   Add inline comments for non-obvious logic, especially around message contracts and async LLM flows.

-   Tests
    -   Add unit tests for services and complex utilities. Keep tests small and deterministic.

## Contribution guidelines (helpful for Copilot to suggest PRs)

These guidelines should help contributors produce consistent PRs that Copilot can emulate.

-   Branching and commits

    -   Use feature branches named `feat/<short-description>` or `fix/<short-description>`.
    -   Keep commits focused and atomic; write clear commit messages with a short summary and optional body.

-   Pull requests

    -   Target the `main` branch via a pull request. Include a short description of the change, relevant context, and testing steps.
    -   Small PRs are preferred. If a PR touches many files, add a design note in the description.

-   Code review

    -   Include unit tests for new behavior where applicable.
    -   Ensure TypeScript compiles and linting passes. Run the extension locally and smoke-test the main flows (open webview, trigger a sample command).

-   Style and tooling

    -   Respect existing ESLint and Prettier settings if present. If the project doesn't include them, keep code style consistent with the rest of the repo.

-   Accessibility and UX
    -   Webview UI should follow basic accessibility practices: semantic HTML, focus management for modals/popovers, and readable text contrast.

## Message contract & integration notes

-   Webview <-> Extension messaging

    -   Use structured JSON messages with a `type` field and a `payload` object. Examples: `{ type: 'clarification.request', payload: { question: string } }`.
    -   Common message types: 'refine', 'generatePlan', 'refine-response', 'planGenerated', 'error'.
    -   Keep message names stable. Add new message types to a shared `types` file and update both sides.

-   LLM usage
    -   Keep prompts and prompt templates in `src/prompts` files (they already exist). When changing prompts, include unit tests that validate the substitution behavior.

## Helpful tips for Copilot suggestions

-   When adding features, wire up these pieces:

    1.  Add/extend TypeScript types in `src/types/interfaces.ts`.
    2.  Create or update a service in `src/services` that encapsulates logic.
    3.  Expose commands in `src/extension.ts` and wire handlers in `src/handlers`.
    4.  If UI is needed, add components under `webview/src/components` and any hooks under `webview/src/hooks`.

-   For changes touching both extension and webview, ensure message contracts are updated and both sides are tested manually in-browser and via unit tests when possible.

## Quick-start for contributors

1. Install dependencies for both the extension and webview (run `npm install` in each folder where `package.json` exists).
2. From the extension folder, compile TypeScript: `npm run compile` (or `npm run watch` for auto-recompile).
3. From the webview folder, run the dev server: `npm run dev` (starts Vite dev server, usually on localhost:5173).
4. For standalone webview development, use `npm run save-clarification` or start json-server with `npx json-server db.json`.
5. Open the extension in VS Code debug mode or install it to test the full integration.
