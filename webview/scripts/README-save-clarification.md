Save Clarification CLI

This small script appends a clarification to `src/services/jira.json` and merges any provided `modified` fields into the `refined` section.

Usage (Windows cmd.exe):

node scripts\save-clarification.js --question "Is this required?" --response "Yes" --author "Alice" --modified "{\"summary\":\"Updated summary\"}"

Behavior:

-   If `original` is not present, it will be created from the existing top-level `key` and `fields`.
-   `refined` is created/updated by shallow-merging `modified` into it.
-   A clarifications entry is appended with metadata and a `refinedSnapshot`.
-   `history` and `meta.currentVersion` are updated.
-   The write is atomic (written to `.tmp` then renamed).

Dependencies: none built-in to the repo (script uses only Node core plus `minimist` and `uuid` if installed). If you prefer, call the service functions directly from code instead of the script.
