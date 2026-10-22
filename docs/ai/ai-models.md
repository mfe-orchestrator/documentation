---
sidebar_position: 2
title: AIs of an organization and the projects that use them
sidebar_label: AIs and providers
description: Add Claude, GPT on Azure OpenAI or Gemini to an organization, choose which projects use each AI, and set the system AI of a self-hosted installation.
keywords: [ai models, ai providers, claude, anthropic, azure foundry, aws bedrock, azure openai, gpt-5.6, responses api, gemini, system ai]
---

# AIs of an organization and the projects that use them

The assistant, the project draft of the new project wizard and Edit with AI run on the AIs an
**organization** defines. Each AI is a provider, a model and the credentials to reach it. An
organization may define several, for example Claude for every team and GPT on the Azure subscription
of one department, and the user picks one per request.

## Add an AI

In the organization settings (`/organization`), the **AI** tab lists under **Artificial intelligences**
the AIs of the organization: every member sees the list; owners and admins add, edit and delete AIs with **Add AI**.

| Provider in the form | Model | Configuration | Model field |
| --- | --- | --- | --- |
| **Claude (Anthropic)** | Claude through the Anthropic API | API key | Optional, `claude-opus-5-5` when empty |
| **Claude (Azure AI Foundry)** | Claude deployed on Microsoft Foundry | Resource, API key | The deployment, optional, `claude-opus-5-5` when empty |
| **Claude (AWS Bedrock)** | Claude through Amazon Bedrock | Region, access key ID, secret access key | Required: the Bedrock model id or inference profile |
| **GPT (Azure OpenAI)** | GPT deployed on Azure OpenAI | Endpoint, API key, **Reasoning model** | Required: the deployment |
| **Gemini (Google)** | Gemini through the Gemini API | API key | Required, for example a current Gemini Pro |

Every AI also has:

- a **Name**, unique in the organization whatever the case;
- an optional **Maximum effort**, the highest [reasoning effort](./reasoning-effort.md) users can pick
  with it;
- **Default AI**: preselected in every project that can use it. At most one AI of the organization is
  the default, so marking one unmarks the others.

### Credentials

API keys and secret access keys are stored encrypted, like the storage credentials (see
[Encryption at rest](../self-hosting/encryption-at-rest.md)), and never shown again. When you edit an AI,
leave a hidden value as it is to keep it. A stored key is kept only for the provider, resource, endpoint
and access key it was saved with: point the AI somewhere else and the form asks you to type the key
again, so a key is never sent where it was not meant to go.

Deleting an AI removes it from every project restricted to it. Deleting the organization deletes its
AIs.

## Provider notes

### Claude (Anthropic)

Requests that Claude declines are retried on another model by the Anthropic API itself.

### Claude (Azure AI Foundry)

The **Resource** is the name of the Foundry resource, as in `https://<resource>.services.ai.azure.com`,
and the model is the name of the Claude deployment. Foundry has no server-side fallback: a declined
request is reported as declined.

### Claude (AWS Bedrock)

Requests go to the Messages API of Bedrock in the region you set, signed with the access key of the
form, never with the AWS credentials of the server. The model is a Bedrock model id such as
`anthropic.claude-opus-5-5`, or an inference profile such as `global.anthropic.claude-sonnet-5-5`; the
key needs permission to invoke it. Effort, reasoning, prompt caching and structured outputs work as on
the Anthropic API.

### GPT (Azure OpenAI)

The **Endpoint** is `https://<resource>.openai.azure.com/` and the model is the name of the GPT
deployment. Requests go to the v1 endpoint through the **Responses API**, so there is no api-version to
set: Chat Completions rejects function tools with reasoning on from GPT-5.6 onwards, which is why the
Responses API is used. Nothing is stored on Azure: the conversation is sent whole on every turn.

Turn **Reasoning model** on for reasoning deployments (GPT-5 and later, o-series): the effort is then
sent to the model. Leave it off for other models, which reject it.

The endpoint must be an Azure host: `https://<resource>.openai.azure.com/`,
`.cognitiveservices.azure.com` or `.services.ai.azure.com`, with no IP address, no credentials, no port
other than 443 and no path. The server sends the key there, so an arbitrary URL would let an
organization administrator reach the network the server runs in. For the sovereign clouds a
self-hosted installation adds suffixes with `AZURE_OPENAI_ENDPOINT_SUFFIXES`, comma separated, for
example `.openai.azure.us,.openai.azure.cn`.

### Gemini (Google)

The model has no default, because Gemini models are retired often. Use a model with function calling,
such as a current Gemini Pro. Gemini ignores the reasoning effort.

:::note Errors from the provider
A provider's own error message is never shown in the console: you get a generic error, or a rate limit
notice, and the provider's message goes to the server log. Edit with AI retries by itself when the model
hits its rate limit.
:::

## Which AIs a project may use

By default a project may use every AI of its organization, including those added later. Under
**Project access** in the same tab, owners and admins choose, project by project:

- **All the AIs of the organization** (the default), including those added later;
- **Only the selected AIs**: an AI added later is not included;
- no AI at all: the assistant and the AI features are turned off in that project, and nothing is sent
  to any provider.

The AI preselected in a project is the organization's default when the project may use it, otherwise
the first one available. A request naming an AI the project may not use is refused before anything
starts. A follow-up in Edit with AI runs on the AI of the previous message unless you pick another one:
switching AI in the middle of a conversation is safe, because the conversation holds nothing specific to
a provider.

The new project wizard runs before the project exists, so it uses the AIs of the organization the
project is created in.

## The system AI

A self-hosted installation can describe one more AI in its environment variables: the **System AI**,
offered to every organization next to its own AIs. It is read-only in the console and can be left out of
a project like any other. Without these variables there is no system AI.

| `AI_PROVIDER` | Model | Required variables | Optional |
| --- | --- | --- | --- |
| `anthropic` | Claude, Anthropic API | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` (`claude-opus-5-5`) |
| `azure-foundry` | Claude on Microsoft Foundry | `AZURE_FOUNDRY_RESOURCE`, `AZURE_FOUNDRY_API_KEY` | `AZURE_FOUNDRY_MODEL` (`claude-opus-5-5`) |
| `aws-bedrock` | Claude on Amazon Bedrock | `AWS_BEDROCK_REGION`, `AWS_BEDROCK_ACCESS_KEY_ID`, `AWS_BEDROCK_SECRET_ACCESS_KEY`, `AWS_BEDROCK_MODEL` | |
| `azure-openai` | GPT on Azure OpenAI | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` | `AZURE_OPENAI_REASONING` (`false`) |
| `gemini` | Gemini, Gemini API | `GEMINI_API_KEY`, `GEMINI_MODEL` | |

- `AI_PROVIDER` left empty with `ANTHROPIC_API_KEY` set means Claude through the Anthropic API.
- A provider named without one of its required variables stops the backend at boot, with the missing
  variables in the error.
- `AI_MAX_EFFORT` (`low`, `medium`, `high`, `xhigh` or `max`) is the maximum effort of the system AI.
- `ASSISTANT_RATE_LIMIT_MAX` (default `20`) caps the questions to the assistant per minute; Edit with AI
  requests count against it too.

```yaml
# docker-compose: Claude through the Anthropic API as the system AI
environment:
  AI_PROVIDER: anthropic
  ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
  AI_MAX_EFFORT: high
```

Authentication is by API key on every provider (access key on Bedrock).
