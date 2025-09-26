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

## GitHub Copilot + Project Instructions

Purpose: provide explicit, actionable guidance so GitHub Copilot (and other AI assistants) can give higher-quality, context-aware suggestions for contributors working on this repository.

This file contains the canonical project overview and rules Copilot should follow. It is intentionally written for both a human reader and an automated assistant.

---

## 1) High-level project summary

-   Repo contains a VS Code extension under `extension/` and a companion React + Vite webview under `webview/`.
-   Main goal: help developers refine Jira stories into reproducible code plans and automated execution flows using LLM-driven features (clarifications, plan generation, execution helpers, and refinement).

## 2) Important locations (what changes where)

-   `extension/` — TypeScript extension code (activation, command registration, message handlers, services that call LLMs).
    -   Key files: `src/extension.ts`, `src/index.ts`, `src/handlers/`, `src/managers/webviewManager.ts`, `src/services/`, `src/types/`, `src/prompts/`.
-   `webview/` — React + Vite app used inside the extension webview.
    -   Key areas: `src/components/`, `src/services/`, `src/context/`, `src/hooks/`, `db.json` for mock data and `scripts/save-clarification.js` for offline flows.

## 3) How Copilot should reason when editing or suggesting code

-   Prefer TypeScript-first solutions. Keep `strict` typing and avoid `any` unless there is a migration comment.
-   Follow separation of concerns: extension activation vs message handling vs LLM orchestration vs UI rendering.
-   When adding functionality, wire up these pieces:
    1. Types in `extension/src/types` (or `webview/src/models`).
    2. Small service in `src/services` that encapsulates external calls.
    3. Command registration in `extension/src/extension.ts` and handler in `src/handlers`.
    4. UI components in `webview/src/components` and hooks in `webview/src/hooks`.

## 4) Coding style & conventions (for Copilot suggestions)

-   Naming: camelCase for variables/functions; PascalCase for types/components.
-   Exports: prefer named exports. Default exports allowed for React components only when it simplifies imports.
-   JSDoc: every exported public class/function should have a brief JSDoc describing inputs, outputs and error modes.
-   Tests: provide unit tests for services and non-trivial logic. Tests should be deterministic and fast.

## 5) Message contracts and prompts

-   Webview ↔ Extension: use structured JSON messages with `type` and `payload`. Example: `{ type: 'clarification.request', payload: { question: string } }`.
-   Keep message type names stable. Add new message types to `src/types/interfaces.ts` and update both extension and webview.
-   Keep prompts and prompt templates in `src/prompts/`. Any change to prompts should include a small unit test that verifies template substitution.

## 6) When Copilot should ask clarifying questions

-   If a requested change affects message contracts, project-wide types, or public APIs, prefer asking the developer for clarification rather than making assumptions.
-   If a change touches both `extension/` and `webview/`, request confirmation about the message contract or create a minimal compatibility shim and add a TODO comment.

## 7) Pull request & commit guidance

-   Branch naming: `feat/<short>`, `fix/<short>`, `chore/<short>`.
-   PRs should include: short description, testing steps, list of files changed, and any manual test instructions (e.g., how to open the webview).

## 8) Quick-start developer workflow (human-oriented)

1. Run `npm install` inside both `extension/` and `webview/`.
2. From `extension/` run `npm run compile` (or `npm run watch`).
3. From `webview/` run `npm run dev` to start the Vite dev server.
4. For offline or demo data, run `npx json-server db.json` from the `webview/` folder.

## 9) Helpful tips for Copilot output

-   When producing changes, include small tests and update types. If you add a new message type, update `src/types` and both sides of the messaging code.
-   Avoid wide-reaching refactors without tests. If you perform a refactor, add a short unit-test that proves behavior parity.
-   For prompt changes, add a test in `extension/src/services/__tests__` that asserts expected substitutions.

## 10) Problems and edge-cases Copilot should consider

-   Null/missing payloads in messages: validate inputs and always return helpful error messages.
-   Backwards compatibility across message versions: prefer additive changes and optional properties.
-   Long-running LLM calls: add timeouts and user-facing progress states in the webview.

## 11) How to use these docs with GitHub Copilot

-   For best results, include explicit references in your prompts: "Follow `.github/copilot-instructions.md` and use the prompt template in `docs/COPILOT_PROMPTS.md`."
-   Open key docs in your editor before using Copilot to increase context availability.
-   After Copilot suggests changes, run local tests (e.g., `npm test` in extension) and CI to validate.

---

If you (human) need a shorter onboarding for other devs or a library of ready-to-use Copilot prompts, see `docs/copilot/README.md` and `docs/COPILOT_PROMPTS.md` in this repo.
