---
sidebar_position: 1
---

# Projects

A **project** is the top-level container in MFE Orchestrator and the boundary for access control.
Microfrontends, environments, storages, code repositories, API keys and members all belong to
exactly one project.

## What belongs in one project

A good rule of thumb: **one project per application**, where an application is a set of
microfrontends deployed together and sharing a host.

Signs you want a second project rather than a bigger one:

- The microfrontends are never deployed together
- Different teams should not see each other's configuration
- The release cadences are unrelated
- The environments genuinely differ (not just in values, but in which environments exist)

Signs you want one project:

- A shared host loads all of them
- They are promoted through the same stages
- The same people manage all of them

Bear in mind that microfrontends can only be wired into a host graph *within* a project, and API
keys are project-scoped. Splitting an application across projects means losing the relation graph
that generates your Module Federation configuration — usually not worth it.

## Creating a project

Your first project is created during onboarding: after registering, you are asked for a project
name.

Additional projects are created through the **project wizard**, which walks you through:

1. **Project details** — name and description
2. **Environments** — pick from a set of default stages, or define your own
3. **Optional resources** — connect a code repository or a storage bucket

The wizard remembers where you got to, so you can leave and resume.

## Switching projects

The project selector sits in the console header. Everything below it — microfrontends, deployments,
settings — follows the selection.

If a page looks empty, check the selected project before anything else. It is the most common cause
of "my microfrontends disappeared".

## Project settings

**Settings** in the sidebar is the project's control panel. It shows a configuration summary with
counts, linking through to each area:

| Card | Leads to |
| --- | --- |
| Team Members | [Members and roles](./users-and-roles.md) |
| Environments | [Environments](../environments/overview.md) |
| API Keys | [API keys](../ci-cd/api-keys.md) |
| Storages | [Buckets](../buckets/overview.md) |
| Code Repositories | [Code repositories](../repositories/connect/github.md) |

### Project information

Under **Project Information** you will find:

| Field | Notes |
| --- | --- |
| **Name** | Editable display name |
| **Slug** | URL-friendly identifier, part of storage paths |
| **ID** | The project id used in API calls and public serve URLs |

The **ID** is what you need for the serve API and for `project-id` headers — this is where to copy
it from.

:::caution The slug is part of your storage paths
Artifacts are stored under `<projectSlug>-<projectId>/…`. The id keeps paths unique regardless, but
be aware the slug appears in bucket paths when auditing storage.
:::

## Deleting a project

**Settings → Danger Zone → Delete Project** removes the project and all its data:
microfrontends, environments, variables, deployment history, API keys and member assignments.

You must type the project name to confirm. There is no undo and no soft delete.

What is *not* deleted:

- Files already stored in **your own buckets** — the storage connection goes away, the objects stay
- **Git repositories** created from templates — those live in your provider
- Secrets written into your Git provider — remove `MICROFRONTEND_ORCHESTRATOR_API_KEY` yourself if
  you want it gone

:::caution Deleting a project breaks live applications
Every public serve endpoint for that project stops answering immediately. Any application currently
loading microfrontends through it will fail to load them. Make sure nothing is serving from the
project before you delete it.
:::

## API access

When calling the management API directly, the project is selected with a header:

```http
project-id: 68f1a2b3c4d5e6f7a8b9c0d1
```

Some endpoints also take an `environment-id` header for environment-scoped resources such as
variables. Requests authenticated with an [API key](../ci-cd/api-keys.md) derive the project from
the key and do not need the header.
