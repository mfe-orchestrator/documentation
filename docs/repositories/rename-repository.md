---
sidebar_position: 5
title: Rename a code repository
sidebar_label: Rename a repository
description: Rename the Git repository linked to a microfrontend from the console, through the API or from the assistant, and what happens to the old URL.
keywords: [rename repository, code repository, clone url, microfrontend]
---

# Rename a code repository

The repository linked to a microfrontend can be renamed at the provider without leaving the console.
MFE Orchestrator renames it on GitHub, GitLab or Azure DevOps and updates the repository name and clone
URLs it keeps. The name and the slug of the microfrontend do not change.

## From the console

1. Open the microfrontend and go to the **Code repository** section of its form.
2. Click **Rename repository**. The button is shown for a microfrontend that is already saved and has
   a linked repository, and is disabled while the repository fields have unsaved changes: save first.
3. Type the **New repository name** and click **Rename**.

The dialog shows the new URL and reminds you that local clones must update their remote URL:

```bash
git remote set-url origin <new-url>
```

:::caution The old URL
GitHub and GitLab redirect the old URL to the new one. Azure DevOps does not: there the old URL stops
working, so update every clone, pipeline and bookmark that uses it.
:::

## The name

Use letters, numbers, dots, hyphens or underscores, at most 100 characters, starting with a letter or a
number and not ending with a dot. A name ending in `.git` or `.atom` is refused, and so is the current
name.

| Code | Meaning |
| --- | --- |
| `INVALID_REPOSITORY_NAME` | The name is not valid |
| `REPOSITORY_NAME_TAKEN` | A repository with this name already exists |
| `REPOSITORY_NOT_LINKED` | The microfrontend has no linked repository |
| `REPOSITORY_LINK_INCONSISTENT` | The saved link does not match the repository shown: select the repository again and save |

A refusal from the provider is reported with its reason.

## From the API and the assistant

```http
POST /api/microfrontends/:id/repository/rename
```

```json
{ "name": "checkout-fe" }
```

The response is the updated microfrontend, with the new name and clone URLs. The same action is the
`microfrontend_repository_rename` tool of the [Maestro assistant](../ai/assistant.md) and of the
[MCP server](../ai/mcp-server.md); both ask you to confirm before it runs.
