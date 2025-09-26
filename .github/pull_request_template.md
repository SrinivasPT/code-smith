# Pull Request Checklist

Use this template to provide a consistent PR description and ensure Copilot/human reviewers can validate changes quickly.

## Description

-   One-line summary of the change:

## Motivation and context

-   Why is this change needed? What problem does it solve?

## Files changed

-   List the main files modified (e.g., `extension/src/services/PlanGenerationService.ts`, `webview/src/components/PlanPanel.tsx`)

## Copilot prompt used (if applicable)

-   Describe the prompt given to Copilot to generate this change (helps reviewers understand the context).

## Checklist (required before review)

-   [ ] I have read `.github/copilot-instructions.md` and `docs/DEVELOPER_ONBOARDING.md`.
-   [ ] TypeScript builds for both `extension/` and `webview/` without errors.
-   [ ] I updated/added message types in `extension/src/types/interfaces.ts` when the change affects messaging.
-   [ ] Prompts changed or added are in `extension/src/prompts` and have a small template test (if applicable).
-   [ ] I added unit tests for new behavior and they pass locally.
-   [ ] External calls (LLMs / network) are mocked in unit tests.
-   [ ] I included a brief testing/integration note for manual reviewers (how to run the flows).

## PR size and risk

-   Estimated impact: low / medium / high
-   Any backwards compatibility concerns?

## How to test manually

-   Steps to reproduce the main flows in the PR (include exact dev server/extension steps if needed).

## Notes for reviewers / Copilot

-   Focus on message contract changes and prompt logic.
-   If the PR touches both webview and extension, ensure message names and types match across the boundary.

Thank you for your contribution — your attention to these checks makes Copilot suggestions more reliable for everyone.
