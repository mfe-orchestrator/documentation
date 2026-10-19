---
sidebar_position: 7
title: Edit a microfrontend with AI
sidebar_label: Edit with AI
description: Describe a change, refine it in a conversation with an AI agent, review the diff and open a pull request on the microfrontend's repository.
keywords: [ai, edit with ai, code agent, pull request, follow-up, conversation]
---

# Edit a microfrontend with AI

**Edit with AI** is the screen a microfrontend opens on. You describe a change ("add a 404 page"),
an AI agent works on the microfrontend's repository and proposes the change as a diff. You refine it
by chatting with the agent, and once it is right you approve it: MFE Orchestrator commits the files
on a new branch, pushes it and opens a pull request (a merge request on GitLab).

Nothing reaches the repository until you approve. The same screen exists for backend services.

## Before you start

- The installation has an AI provider configured. On self-hosted installations see
  [Configuration](#configuration); without one, the screen is not shown.
- The microfrontend has a code repository connected: [GitHub](../repositories/connect/github.md),
  [GitLab](../repositories/connect/gitlab.md) or [Azure DevOps](../repositories/connect/azure.dev-ops.md).
- You are a member of the project other than a viewer, or an administrator of its organization.
  Viewers can follow the requests but can neither ask for a change nor apply one.

## Ask for a change

Click **New change**, describe what you want and press **Generate proposal** (or ⌘/Ctrl + Enter).
Under **Advanced options** you can set the **Base branch** the agent starts from; by default it is
the repository's default branch.

The agent reads the repository together with the AI context written for the project and for the
microfrontend, then edits the files. Its progress shows live under the request.

## Refine it in a conversation

When the proposal is ready you see the agent's summary and the diff of every file it changed. If it
is not quite right, write in the box under it and press **Enter** (Shift + Enter for a new line):

> Also link the page from the footer.

Each message is a follow-up. The agent starts from the files of the previous proposal, knows what
you asked before, and its new proposal **replaces** the previous one, which is marked as refined by
the next message. Only the latest proposal can be applied.

- While the agent works, the box waits for it to finish.
- If a follow-up fails, the previous proposal stays open: you can apply it, or ask again.
- The queue on the left shows one entry per conversation, with how many messages it has.

## Apply or discard

**Apply and open pull request** applies the whole proposal: its files depend on each other, so none
can be left out. MFE Orchestrator then:

1. checks that every file is still what the agent saw on the base branch. If one changed in the
   meantime, the apply stops with a conflict and nothing is overwritten: ask for the change again;
2. commits the files on a new `ai/<microfrontend>-<timestamp>` branch, with you as the author;
3. pushes it and opens a pull request named after the first message of the conversation, with every
   message quoted in its description.

The branch runs your repository's CI like any other, with the repository's secrets: review the diff
before applying. If the provider refuses to open the pull request (for example a token without that
permission), the branch stays pushed and the console tells you, so you can open it by hand.

**Discard** throws the proposal away without pushing anything. Once a proposal is applied or
discarded the conversation is closed: start a new change to go on.

## What the agent can and cannot do

- It reads, searches, writes and deletes files **inside the repository only**.
- It never reads files that usually hold credentials (`.env*`, `.npmrc`, `*.pem`, `*.key`, ...).
- It never changes CI configuration (`.github/workflows`, `.gitlab-ci.yml`, `azure-pipelines*.yml`)
  or lockfiles.
- It runs nothing: no install, build or test. Your CI checks the pull request.
- At most 20 files and 500 KB written per request.
- It never pushes: only your approval writes to the repository, and only on a new branch.

Proposals nobody applies or discards are removed after 7 days. Applied conversations are kept.
The tokens each request used are shown under it.

## Configuration

On a self-hosted installation, AI is off until an AI provider is configured with `AI_PROVIDER`
(`anthropic`, `azure-foundry`, `gemini` or `azure-openai`) and the variables of that provider, for
example `ANTHROPIC_API_KEY`. The agent was written and tested with Claude.

The agent works on a local clone of each repository, which is only a cache:

| Variable | Default | What it does |
| --- | --- | --- |
| `REPOSITORIES_FOLDER` | `/repositories`, `/data/repositories` in the all-in-one image | Where the clones are kept. |
| `REPOSITORIES_MAX_SIZE_MB` | `500` | A clone bigger than this is refused and deleted. |
| `REPOSITORIES_EVICT_AFTER_DAYS` | `14` | Clones not used for this long are deleted. |

Credentials are never written to disk, and no repository hook is ever run. On Kubernetes the Helm
chart mounts an `emptyDir` there (`repositories.sizeLimit`, 10Gi by default); set
`repositories.existingClaim` to keep the clones across restarts.
