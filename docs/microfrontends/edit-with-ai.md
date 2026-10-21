---
sidebar_position: 7
title: Edit a microfrontend with AI
sidebar_label: Edit with AI
description: Describe a change, refine it in a conversation with an AI agent, review the diff, then push it onto the base branch or open a pull request.
keywords: [ai, edit with ai, code agent, pull request, follow-up, conversation, feature branch]
---

# Edit a microfrontend with AI

**Edit with AI** is the screen a microfrontend opens on. You describe a change ("add a 404 page"), an AI
agent works on the microfrontend's repository and proposes the change as a diff. You refine it by
chatting with the agent, and once it is right you either push it onto the base branch or open a pull
request (a merge request on GitLab) to have it reviewed first.

The proposal lives on a feature branch of its own: the base branch is not touched until you apply.

## Before you start

- The project has an AI available: see [AIs of an organization](../ai/ai-models.md). Without one, the
  screen is not shown.
- The microfrontend has a code repository connected: [GitHub](../repositories/connect/github.md),
  [GitLab](../repositories/connect/gitlab.md) or [Azure DevOps](../repositories/connect/azure.dev-ops.md).
- You are a member of the project other than a viewer, or an administrator of its organization.
  Viewers can follow the requests but can neither ask for a change nor apply or discard one.

## Ask for a change

Click **New change**, describe what you want and press **Generate proposal** (or ⌘/Ctrl + Enter). Next to
the prompt you pick the [AI](../ai/ai-models.md) and the [reasoning effort](../ai/reasoning-effort.md);
**high** by default.

Under the prompt the console shows the repository the agent works on, linked to its page on the provider,
and the branch it starts from: the repository's default branch unless you pick another one from its
branches.

The agent reads the repository together with the [AI context](../ai/ai-context.md) of the project and of
the microfrontend, and the stack detected in the repository, then edits the files. Its progress shows
live under the request, Claude's reasoning included. If the model hits its rate limit, the request waits
and retries by itself.

When the agent is done, the console commits the proposal on the feature branch
`ai/<microfrontend>-<timestamp>`, with you as the author, and pushes it.

## Refine it in a conversation

When the proposal is ready you see the agent's summary and the diff of every file it changed. If it is
not quite right, write in the box under it and press **Enter** (Shift + Enter for a new line):

> Also link the page from the footer.

Each message is a follow-up. The agent starts from the files of the previous proposal, knows what you
asked before, and its new proposal **replaces** the previous one, which is marked as refined by the next
message. Only the latest proposal can be applied. Every follow-up updates the same feature branch, so a
pull request opened on it always shows the latest proposal.

- While the agent works, the box waits for it to finish.
- If a follow-up fails, the previous proposal stays open: you can apply it, or ask again.
- A follow-up that only answers a question, without changing a file, pushes nothing.
- The queue on the left groups the requests: awaiting approval, in progress, applied, discarded and
  failed, with how many messages each conversation has.

## Apply, open a pull request or discard

| Action | What happens |
| --- | --- |
| **Apply to `<branch>`** | The proposal is pushed straight onto the base branch, with no review. Its CI starts right away |
| **Open a pull request** | A pull request from the feature branch onto the base branch, to review it in the repository first. The proposal stays open: you can still refine, apply or discard it |
| **Discard** | The proposal is thrown away and its feature branch deleted, unless a pull request is open on it |

All the proposed files go together: they depend on each other, so none can be left out. Before applying,
the console checks that every file is still what the agent saw on the base branch. If one changed in
the meantime, the apply stops with a conflict and nothing is overwritten: ask for the change again.

The push is never forced. A protected base branch refuses it, and the console suggests opening a pull
request instead. If the provider refuses to open the pull request (for example a token without that
permission), the console tells you why and the feature branch stays pushed.

The commit and the pull request are named after the first message, and the pull request description
quotes every message of the conversation. Once a proposal is applied or discarded the conversation is
closed: start a new change to go on.

:::caution Pipelines that run on every branch
Each proposal is pushed on its feature branch as soon as the agent is done, so a pipeline that runs on
every branch runs the agent's code, with the repository's secrets, before anyone has reviewed it. Limit
such pipelines, or their secrets, to protected branches.
:::

## Change several microfrontends at once

From the [AI agent page](../ai/assistant.md#ai-agent-page), **New AI job** starts one agent on several
microfrontends together, at most 10 repositories. It sees them all at once, so one change can span a
host and the remotes that call it, and it proposes one diff per repository, each on its own feature
branch. **Apply all** pushes every proposal onto the base branch of its repository.

## What the agent can and cannot do

- It reads, searches, writes and deletes files **inside the repository only**: `..`, absolute paths,
  `.git` and symlinks pointing out of the repository are refused.
- It never reads files that usually hold credentials (`.env*`, `.npmrc`, `*.pem`, `*.key`, ...).
- It never changes CI configuration (`.github/workflows`, `.gitlab-ci.yml`, `azure-pipelines*.yml`)
  or lockfiles.
- It runs nothing: no install, build or test. Your CI checks the result.
- At most 20 files and 500 KB written per request, 40 model rounds.
- It never pushes by itself: the console pushes its proposal on a feature branch, and only your
  **Apply** writes on the base branch.

Proposals nobody applies or discards are removed after 7 days; their branch stays. Applied conversations
are kept. The tokens each request used are shown under it, and for the whole conversation.

## Configuration

On a self-hosted installation the AI comes from the organization or from the system AI: see
[AIs of an organization](../ai/ai-models.md#the-system-ai).

The agent works on a local clone of each repository, which is only a cache:

| Variable | Default | What it does |
| --- | --- | --- |
| `REPOSITORIES_FOLDER` | `/repositories`, `/data/repositories` in the all-in-one image | Where the clones are kept |
| `REPOSITORIES_MAX_SIZE_MB` | `500` | A clone bigger than this is refused and deleted |
| `REPOSITORIES_EVICT_AFTER_DAYS` | `14` | Clones not used for this long are deleted |

Every run starts from exactly what the remote has, and two requests on the same repository queue
instead of sharing a checkout. Credentials are never written to disk, no `git` binary is needed and no
repository hook is ever run. On Kubernetes the Helm chart mounts an `emptyDir` there
(`repositories.sizeLimit`, 10Gi by default); set `repositories.existingClaim` to keep the clones across
restarts.
