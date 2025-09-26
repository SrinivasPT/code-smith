# Contributing to code-smith

Thanks for your interest in contributing. This document summarizes the most important rules and links to the Copilot-focused guidance so both human contributors and GitHub Copilot can follow a consistent workflow.

Before you start

-   Read the project guidance for Copilot and prompts: `.github/copilot-instructions.md`.
-   Read the developer onboarding: `docs/DEVELOPER_ONBOARDING.md`.

## Using GitHub Copilot

When using GitHub Copilot, reference the docs in your prompts for best results, e.g., "Follow `.github/copilot-instructions.md` and use a template from `docs/COPILOT_PROMPTS.md`."

Branching and commits

-   Create a branch named `feat/<short-description>` for new features, `fix/<short-description>` for bug fixes, or `chore/<short-description>` for maintenance.
-   Keep commits small and focused. Use imperative commit messages (e.g., `feat: add clarification flow`).

Pull request checklist (required)

Before requesting review, ensure the following are true. The repo will use this checklist in the PR template to make it easy to validate.

-   [ ] TypeScript compiles without errors for the extension and webview.
-   [ ] New or changed message types are added to `extension/src/types/interfaces.ts`.
-   [ ] Prompts are stored/updated in `extension/src/prompts` and include small template substitution tests where applicable.
-   [ ] New behavior has unit tests (happy path + at least one error path where applicable).
-   [ ] Added tests mock external LLM calls or network requests.
-   [ ] PR description explains the motivation and the files changed.

How to run locally

Install dependencies and start both parts of the project (cmd.exe examples):

```cmd
cd extension
npm install
npm run compile
cd ..\webview
npm install
npm run dev
```

Testing

-   Add tests under `__tests__` or next to the related service files. Keep tests deterministic.

Style and docs

-   Use camelCase for functions/vars, PascalCase for types/components.
-   Add brief JSDoc to exported functions/classes.
-   Update `.github/copilot-instructions.md` and `docs/COPILOT_PROMPTS.md` if you change message contracts or prompt templates.

Asking for help

-   Open an issue for design or architecture discussions. Use PR comments for implementation questions.

Thank you for contributing!
