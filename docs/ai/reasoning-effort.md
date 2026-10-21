---
sidebar_position: 3
title: Reasoning effort and visible reasoning
sidebar_label: Reasoning effort
description: Choose how hard the model reasons for each question and each change, read Claude's reasoning as it happens, and cap the effort an AI allows.
keywords: [reasoning effort, thinking, adaptive thinking, effort levels, claude reasoning, max effort]
---

# Reasoning effort and visible reasoning

Next to the AI selector, the assistant and Edit with AI offer a **Reasoning effort**: how hard the model
thinks before it answers. More effort means deeper reasoning, slower answers and more tokens.

## The levels

| Level | Shown as |
| --- | --- |
| `low` | Low |
| `medium` | Medium |
| `high` | High |
| `xhigh` | Extra high |
| `max` | Max |

You choose it per question in the assistant, and per request (and per follow-up) in Edit with AI. When
you choose none:

- the assistant answers at **medium**;
- a new Edit with AI request runs at **high**;
- a follow-up runs at the effort of the message before it.

The effort used is shown next to the tokens of each answer and recorded with the usage.

Reasoning counts towards what a model may write in one turn, so that ceiling grows with the effort: for
the assistant 16K tokens up to `medium`, 32K at `high` and 64K at `xhigh` and `max`; for the code agent
32K up to `high` and 64K above.

## Which providers take it

| Provider | Levels offered |
| --- | --- |
| Claude (Anthropic, Azure AI Foundry, AWS Bedrock) | All five |
| GPT on Azure OpenAI with **Reasoning model** on | Low, medium, high; `xhigh` and `max` are sent as `high` |
| GPT on Azure OpenAI without reasoning, Gemini | None: the choice is hidden |

The levels on Claude need **Claude Opus 4.7, Sonnet 5 or later**. The default model, `claude-opus-5-5`,
is one of them. On Foundry the deployment, and on Bedrock the model id, must be such a model: an older
one rejects the requests.

## Claude's reasoning

Claude returns a summary of its reasoning while it works:

- in the assistant it streams live under **Reasoning**, above the answer, and stays in the saved
  conversation;
- in Edit with AI it appears in the agent's progress log, the first 1,000 characters of each turn.

Secrets are masked in what is kept, as in the answers. The summary changes what you see, not what is
billed. The other providers show no reasoning.

## Cap the effort

An AI can have a **Maximum effort** (the system AI takes it from `AI_MAX_EFFORT`): the console offers no
level above it, and a request asking for more is served at the cap, which is what gets stored. Without a
cap every level the provider takes is offered.

On an installation open to sign-ups the cap bounds the cost of a single question: at `max` each model
turn may write up to 64K tokens.

See [AIs of an organization](./ai-models.md) to set the cap.
