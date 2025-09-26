# Copilot prompt templates and examples

This file contains curated prompt templates that Copilot and human developers can reuse when interacting with LLMs or asking Copilot to make changes in this repository. Use these templates to provide consistent context and to avoid ambiguous requests.

1. Add a new command handler (example)

Context: repository has an extension in `extension/` with handlers in `extension/src/handlers` and the webview in `webview/`.

Prompt template:

"""
You are working on a VS Code extension written in TypeScript. Add a new command called `<commandId>` that does <one-sentence description>. Create/modify the following files:

-   `extension/src/extension.ts`: register the command
-   `extension/src/handlers/commandHandler.ts`: add the handler function

Constraints:

-   Use strict TypeScript types and add a JSDoc for the handler.
-   Do not change existing public APIs unless necessary; if they must change, add a TODO comment and mention it in the PR description.
-   Add a simple unit test for the handler in `extension/src/services/__tests__` if it contains non-trivial logic.

Return: a list of files to change with a short explanation for each and the code diffs.
"""

2. Update a prompt template under `extension/src/prompts`

Prompt template:

"""
You are updating a prompt template used by the LLM service. The new prompt should: 1) include the Jira ticket title and description, 2) ask for clarifying questions, 3) produce a 3-step plan with estimated complexity. Put the template in `extension/src/prompts/<name>.md` and add a unit test that ensures placeholders are substituted correctly.

Return only the new template file contents and a short unit test file.
"""

3. Refactor suggestion style

When Copilot suggests a refactor, prefer small, verifiable changes. Provide:

-   A brief rationale (one paragraph).
-   A test before/after (if possible) demonstrating behavior parity.

4. Message contract change

If a change affects messages between `webview` and `extension`:

-   Update `extension/src/types/interfaces.ts` first.
-   Update both the sender and receiver sides with matching types.
-   Add unit tests or a small integration test demonstrating message round-trip.

5. Prompt to generate tests for a service

"""
Create unit tests for `<ServiceName>` in `extension/src/services`. The tests should:

-   cover the happy path and at least one error path,
-   mock external LLM calls and network requests,
-   run quickly (< 200ms) and be deterministic.

Return: test file contents and where to add mocks.
"""

Guidelines for writers:

-   Keep prompts explicit. Include file paths and expected function/class names when asking for edits.
-   Prefer small diffs and single-responsibility PRs.
-   If in doubt about message shapes, ask a clarifying question instead of guessing.
