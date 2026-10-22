---
sidebar_position: 5
title: AI context, the notes your team writes for agents
sidebar_label: AI context
description: Write Markdown notes for the whole project and for each microfrontend, read by Maestro, by Edit with AI and by every MCP client before they work.
keywords: [ai context, agents, conventions, context_get, AGENTS.md, prompt]
---

# AI context, the notes your team writes for agents

An agent that knows your conventions writes code your reviewers accept. The **AI context** is where
you write them down: free Markdown for AI agents, one for the project and one for each microfrontend.

| Context | Where to edit it | What belongs there |
| --- | --- | --- |
| **Project AI context** | Project settings → **AI context** tab | What applies to every microfrontend: the domain of the product, shared conventions, rules |
| **Microfrontend AI context** | The **AI context** tab of the microfrontend | Its responsibility, its quirks, what not to touch |

Each is Markdown, at most 20,000 characters.

```markdown
## Domain
Customer portal for the B2B shop.

## Conventions
- Strict TypeScript, no `any`
- Shared UI components come from the `design-system` remote: never copy them
- Every user-facing string goes through i18n, in Italian and English
```

## Who reads it

An agent always gets the context of what it works on, plus the project one:

- **Edit with AI** and AI jobs put the project context and the context of each microfrontend in the
  agent's prompt, together with the stack detected in the repository.
- **Maestro** reads the same notes through the same tools.
- **MCP clients** are asked to call `context_get` before working on a project. It returns the project
  context, and the microfrontend one when given a `microfrontendId`; `microfrontend_get` returns the
  same notes in `aiContext`, so a client reading a microfrontend gets them without a second call.
  `project_update` and `microfrontend_update` change them.

Keep the project context short and general, and let each microfrontend say what is specific to it:
agents read both.
