# GitHub Copilot Guidance for code-smith

This folder contains guidance and examples to help GitHub Copilot (and other AI coding assistants) produce useful, consistent code for this project. The goal is to make suggestions that are type-safe, testable, and easy for humans to review.

Key focus areas:

-   Follow TypeScript-first patterns and prefer explicit types. Use the `src/types` location for shared types.
-   Encapsulate external calls (LLMs, Jira) in services under `extension/src/services` or `webview/src/services`.
-   Keep UI pure: React components in the webview should be presentational; side effects belong in hooks.
-   When making multi-file changes (extension + webview), update message contracts in `src/types/interfaces.ts` first.

Quick checks Copilot should run before suggesting code:

1. Is there an existing type for this data shape? If yes, use it.
2. Does this change affect message contracts? If yes, update both sides and add a unit test.
3. Are prompts stored in `src/prompts`? If creating or editing a prompt, add a template test.

See `../COPILOT_PROMPTS.md` for ready-to-use prompt templates and examples.

## Using these docs with Copilot

To get consistent, high-quality suggestions, include explicit references in your Copilot prompts, e.g., "Follow `docs/copilot/README.md` and the rules in `.github/copilot-instructions.md`."
