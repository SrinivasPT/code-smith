# Developer Onboarding — code-smith

This document helps new developers get up to speed and gives hints Copilot can use to create valuable suggestions.

Minimum requirements

-   Node.js 18+ (LTS recommended)
-   npm 9+ (or yarn/pnpm)
-   VS Code with the Extension Development Host (optional but recommended)

Setup

1. Install dependencies in both folders:

```cmd
cd extension
npm install
cd ..\webview
npm install
```

2. Build the extension code (watch mode useful during development):

```cmd
cd extension
npm run compile
```

3. Run the webview dev server:

```cmd
cd webview
npm run dev
```

4. (Optional) Run mock API server for offline webview development:

```cmd
cd webview
npx json-server db.json --port 3001
```

Testing

-   Unit tests should live next to services or in `__tests__` folders. Run tests with the repo's test commands (if present) or add `npm test` scripts.

Code style and checks

-   Keep TypeScript `strict` mode happy; prefer types in `src/types`.
-   Add JSDoc to exported functions/classes.
-   Update `src/prompts` when modifying prompt behaviour and include a small test.

Working on features that touch both the extension and webview

1. Add/extend types in `extension/src/types/interfaces.ts`.
2. Implement extension-side logic in `extension/src/services` and wire commands in `extension/src/extension.ts`.
3. Update webview UI in `webview/src/components` and messaging hooks in `webview/src/hooks`.
4. Add or update tests for message contracts.

Making Copilot-friendly commits

-   Make small, focused commits with an explicit purpose. Example: `feat: add clarification flow + tests`.
-   When asking Copilot for a change, include the exact files and the constraints (typing, docs, tests).

Where to ask questions

-   Open an issue in the repository for design-level questions.
-   Use inline PR comments for implementation-level questions.

Quick checklist for PRs

-   Does TypeScript compile?
-   Are new message types added to `src/types/interfaces.ts`?
-   Were prompts added/updated in `src/prompts` and tested?
-   Are there small unit tests for new behavior?
