---
sidebar_position: 1
title: AI in MFE Orchestrator
sidebar_label: Overview
description: What runs on AI in the console, which AI it runs on, who can use it and how to turn it off for a project or a whole installation.
keywords: [ai, assistant, maestro, edit with ai, mcp, ai models, reasoning effort]
---

# AI in MFE Orchestrator

AI in MFE Orchestrator works on your microfrontends: it reads the project, explains what it sees,
changes the code of a microfrontend through a pull request or a push you approve, and lets the AI
clients you already use act on the project through MCP.

## What runs on AI

| Feature | What it does | Where |
| --- | --- | --- |
| [Edit with AI](../microfrontends/edit-with-ai.md) | An agent changes the repository of a microfrontend and proposes a diff you refine, apply or open as a pull request | The screen a microfrontend opens on |
| AI jobs | One agent changes several microfrontends together, one proposal per repository | **AI agent** page, first in the sidebar |
| [Maestro](./assistant.md) | The assistant of the console: answers about the project and acts on it, asking you before anything destructive | ⌘J / Ctrl+J, on every page of a project |
| Project draft | Describe the project in your own words and the assistant proposes its name, description and environments | The new project wizard |
| [MCP server](./mcp-server.md) | Claude, ChatGPT, Gemini, Cursor, VS Code and other MCP clients read and change the projects you share with them | Settings → General → AI assistants |

The first four run on an AI of your [organization](./ai-models.md). The MCP server runs on no AI of
ours: the client brings its own model and calls the console's tools.

## Which AI

Each organization defines its AIs: a provider, a model and the credentials to reach it. Claude through
the Anthropic API, Microsoft Foundry or Amazon Bedrock, GPT on Azure OpenAI, and Gemini are supported.
A self-hosted installation can add one more AI for everybody, the **system AI**. Every request picks one
in a selector next to the [reasoning effort](./reasoning-effort.md), preselected on the default.

The prompts and the tools were written and tested with Claude: the quality of the assistant and above all
of the code agent depends on the model. See [AIs of an organization](./ai-models.md).

## What the agents know about your project

Agents read the [AI context](./ai-context.md): Markdown notes the team writes for the project (**AI context** tab of the project settings) and for
each microfrontend (conventions, rules, what a microfrontend is responsible for). The assistant, the code
agent and the MCP clients all get the same notes.

## Who can use it

- Every member of a project can talk to Maestro and follow the AI requests.
- A **viewer** cannot change anything: Maestro refuses its writes, and Edit with AI does not let it ask
  for a change, apply or discard one.
- Owners and admins of the organization manage its AIs, in the **AI** tab of the organization settings, and choose which ones each project may use.

Every answer and every request shows the tokens it used, and the server logs them per user and project.

## Turning AI off

- **For a project**: restrict it to no AI in the *Project access* table of the **AI** tab of the organization settings.
  Maestro disappears, Edit with AI is hidden and nothing is sent to any provider.
- **For an installation**: define no AI. Without a system AI and without AIs of the organizations,
  there is nothing to run on.
- **MCP** is off until `MCP_ENABLED=true`: see [MCP server](./mcp-server.md#turning-it-on).
