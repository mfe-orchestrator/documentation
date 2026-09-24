---
sidebar_position: 4
title: Upgrading to organizations
sidebar_label: Upgrading from 3.x
description: "What happens to projects created before 4.0.0: the startup migration that gives each an organization, how owners are chosen, and what to check afterwards."
keywords: [migration, upgrade, 4.0.0, organizations, self-hosting, boot migration]
---

# Upgrading to organizations

Projects created before 4.0.0 have no organization: the concept did not exist. They are given one
automatically, by a migration that runs when the backend starts. There is nothing to run by hand and
no downtime to plan, but it is worth knowing what it decided.

This page matters to [self-hosted](../self-hosting/docker-compose.md) installations upgrading from
3.x. On the hosted console the migration has already run.

## What the migration does

At startup, the backend looks for projects that still have no organization. If there are none — the
normal case on every boot after the first — it stops there.

For the ones it finds:

1. **It picks an owner for each project.** The project's *Admin* (`OWNER` in the API), the oldest
   membership first when there are several. A project whose owner row was lost falls back to its
   most senior accepted member of any role, and that substitution is written to the log as a
   warning: a project nobody can administer is worse than a viewer promoted to owner of their own
   organization.
2. **It creates one organization per owner**, named after the account — *`Name Surname` workspace*,
   falling back to the local part of the email address. All of that person's projects go into the
   same organization, so an installation serving several customers keeps them apart instead of
   pooling everything into one shared tenant.
3. **It carries the other members over**, converting their project role into an organization role.
4. **It stamps the organization onto the projects.**

### How roles are converted

| Project role | Becomes, in the organization |
| --- | --- |
| The picked owner | `OWNER` |
| Admin (`OWNER`) | `ADMIN` |
| Editor (`MEMBER`) | `MEMBER` |
| Viewer (`VIEWER`) | `MEMBER` |
| Any role, invitation still pending | `MEMBER` |

A second Admin of the project becomes an `ADMIN` of the organization rather than a plain member: an
organization has exactly one owner, and demoting the others would take away administration they
already had. A membership still waiting for an answer converts to `MEMBER` whatever role it was for
— an unanswered invitation must not already hand over every project of the organization.

Whoever already holds a role in the target organization keeps it. The migration never demotes.

:::caution Editors and Viewers become plain members
An Editor or a Viewer of one project becomes a plain `MEMBER` of the organization, which reaches
only the projects they were invited to. That is the same set of projects they could see before the
upgrade, so nothing is lost — but it also means they cannot create projects any more. Promote them
to `ADMIN` on the [organization page](./managing-an-organization.md#members) if they need to.
:::

### Projects with no members at all

A project with not a single user attached to it has nobody to name an owner after. Those are
collected into an organization called **Default organization** and the backend logs a warning saying
so. Nobody owns it: assign an owner by hand — directly in the database, or by creating a membership
through the API — otherwise the projects inside it stay unreachable from the console.

## Safe to run, safe to interrupt

Two properties are worth relying on:

- **Idempotent.** The migration only ever looks at projects that still have no organization, so
  running it again — which happens on every boot — costs one empty query and changes nothing.
- **Resumable.** An organization the account already owns is reused rather than duplicated, so an
  interrupted run continues filling the organization the previous pass created instead of opening a
  second one beside it.

It also reads and writes in a fixed number of round trips rather than one query per project, so its
duration does not grow with the size of the installation. That matters at boot: the database plugin
waits for the migrations before the application declares itself ready, and an overrun there means
the API answers `502` while the static files are served normally.

## After the upgrade

Worth checking once, on the [organization page](./managing-an-organization.md):

1. **The organization name.** It was generated from an account name; rename it to whatever your
   team actually calls itself.
2. **The startup log**, for the two warnings the migration can emit — a project with no owner, and
   the *Default organization*.
3. **The member roles.** Everyone who used to administer several projects is now an `ADMIN` of the
   organization and reaches all of them, including projects they were never invited to. That is the
   intended behaviour, but it is a wider reach than they had before — see
   [Roles and project visibility](./roles-and-visibility.md).
4. **Who can create projects.** Only owners and admins can, which is new.

## Endpoints that changed

Three project endpoints had no access control at all before 4.0.0 and are now behind the same gate
as everything else: inviting a collaborator to a project, listing a project's members, and resending
a project invitation. If you drive the API directly, a caller that used to reach them without
belonging to the project will now be refused.

Two more changes affect API clients on this release:

- `PUT /api/projects/:projectId` is schema-bound. It accepts `name`, `description` and `isActive`
  only — `slug` and `organizationId` are not writable, because the slug is part of the storage path
  the already-uploaded bundles live under. The response is the project itself, no longer wrapped in
  `{ success, data }`.
- Stored credentials are never returned by the API any more; a placeholder comes back in their
  place, and a field sent back identical to the placeholder counts as "not retyped".
