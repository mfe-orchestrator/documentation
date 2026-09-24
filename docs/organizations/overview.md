---
sidebar_position: 1
title: Organizations overview
sidebar_label: Overview
description: "An organization is the tenant that owns your projects: a project belongs to exactly one, a user to many. What that changes, and where it lives in the console."
keywords: [organization, tenant, multi-tenancy, workspace, projects]
---

# Organizations overview

An **organization** is the tenant that owns your projects. It sits one level above the project and
answers a question the project alone could not: *which projects does this person get to see at all?*

Two rules follow from that, and everything else in this section is a consequence of them:

- A **project belongs to exactly one organization**, decided when the project is created and never
  changed afterwards.
- A **user can belong to any number of organizations**, with a different role in each.

Organizations were introduced in **4.0.0**. Installations that predate it are migrated automatically
— see [Upgrading to organizations](./upgrading-to-organizations.md).

## Where it sits in the object model

```
Organization
├── Members (Owner, Admin, Member)
└── Project
    ├── Environment (dev, uat, prod, …)
    ├── Microfrontend (host or remote, versioned)
    ├── Storage / Bucket, Code Repository, API Key
    └── Members (Admin, Editor, Viewer)
```

The project is still the boundary every other object belongs to — microfrontends, environments,
deployments, API keys are all project-scoped, and nothing about that changed. What the organization
adds is a boundary *above* the project: an authorization level that decides reachability rather than
ownership. See [Core concepts](../core-concepts.md#the-object-model).

## Why the level exists

Before 4.0.0 the only way to reach a project was to be an explicit member of it. That has two
consequences an installation notices sooner or later:

- **A project could be orphaned.** When the last member of a project left, nobody could open it any
  more — not even the person who administers the platform for that customer.
- **There was nothing to name a customer.** One installation serving several customers had no object
  to keep them apart, and no place to describe who administers what.

The organization solves both. Whoever administers it reaches every project inside it, invited or
not, which means a project cannot become unreachable while its organization has an owner. And each
customer, team or client gets a tenant of its own, with its own membership list.

## One organization at a time

The console works inside one organization at a time. The selected organization is what scopes the
project list underneath it: the project switcher only ever offers projects of the organization you
are in.

![The console header showing the organization name, the project name and the open organization menu](../assets/organization-menu.png)

The header reads as a breadcrumb — *organization › project* — and the organization name is a link to
the [organization page](./managing-an-organization.md#the-organization-page). The button on the
right is the single door to the organization level: settings, switching and creation all start
there. Everything in the sidebar below it is about the project.

:::info The selection is remembered per browser
The organization and the project you are working in are stored in the browser, not on the server.
Signing in from another browser asks again. An account that belongs to exactly one organization is
never asked at all — it is selected automatically.
:::

## Your first organization

A project cannot exist outside an organization, so an account with none is asked to create one
before it reaches anything else. Registration therefore has one more step than it used to:

1. Register and confirm the account.
2. **Create your organization** — a name, and optionally a description.
3. The project wizard opens inside it.

If somebody invited you instead, the pending invitation is offered on that same screen, above the
creation form: accepting it puts you into their organization rather than opening one of your own.

:::caution A plain member cannot create the first project
Only an owner or an admin of an organization can create a project in it. Somebody invited to an
organization as a plain member, with nothing shared with them yet, sees an empty project picker and
the organization switcher — not the project wizard, which would fail on submit. See
[Roles and project visibility](./roles-and-visibility.md).
:::

## Where to go next

- [Roles and project visibility](./roles-and-visibility.md) — who reaches which project, and how
  organization roles interact with project roles
- [Managing an organization](./managing-an-organization.md) — switching, creating, members, settings
  and deletion
- [Upgrading to organizations](./upgrading-to-organizations.md) — what happens to projects created
  before 4.0.0
- [Project members and roles](../project-settings/users-and-roles.md) — the second, finer level of
  access control
