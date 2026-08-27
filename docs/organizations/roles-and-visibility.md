---
sidebar_position: 2
title: Organization roles and project visibility
sidebar_label: Roles and visibility
description: "Owner, Admin and Member at organization level: who reaches every project of the tenant, who reaches only the ones they were invited to, and how that combines with the project role."
keywords: [organization roles, owner, admin, member, permissions, project visibility, access control]
---

# Organization roles and project visibility

Access in MFE Orchestrator is decided at two levels, but only one of them restricts anything today.
The **organization role** decides which projects you can reach at all, and it is enforced. The
**project role** is a label: it is stored, shown and carried in invitation emails, but no
authorization check consults it, so reaching a project at all is what grants full control of it. See
[Project members and roles](../project-settings/users-and-roles.md) for the detail and the
consequences.

## The three organization roles

| Role in the console | In the API | Reaches | Can also |
| --- | --- | --- | --- |
| **Owner** | `OWNER` | Every project of the organization | Everything an Admin can, plus granting and taking ownership, and deleting the organization |
| **Admin** | `ADMIN` | Every project of the organization | Rename the organization, invite and remove members, change roles, create projects |
| **Member** | `MEMBER` | Only the projects they were invited to | Nothing at organization level — the role grants no access on its own |

Owner and Admin administer the organization and are treated identically by every visibility check.
They differ in three places only:

- the **last owner** cannot be removed or demoted, because an organization with no owner could no
  longer be administered by anybody;
- **only an owner** can make somebody an owner, or take that role away — an admin cannot promote
  themselves;
- **only an owner** sees the [danger zone](./managing-an-organization.md#danger-zone) and can delete
  the organization.

## What a Member actually gets

Belonging to an organization as a plain member grants nothing by itself. It is a seat, not an
access: a member who has been invited to no project sees an empty project list, and the members
table records that honestly.

![The organization members table and the Projects column, reading All projects on the owner row](../assets/organization-members.png)

The **Projects** column is the visibility rule made visible. Owners and admins read *All projects*,
because that is literally what they reach; a member reads the number of projects of this
organization they were actually invited to.

A member also cannot create a project. Project creation is reserved to whoever administers the
organization — otherwise adding something to a tenant you only visit would be the one thing a member
could do that an admin never approved.

## How the two levels combine

For a given project, the question *can this user open it?* has exactly two ways to answer yes:

1. the user holds a **project membership** on it — an invitation they accepted, whatever the project
   role; or
2. the user **administers the organization** that owns the project.

If neither holds, the project is not returned in any listing and every endpoint touching it is
refused. The rule lives in a single gate shared by every backend service, so it applies uniformly to
microfrontends, environments, variables, storages, repositories, builds and deployments — there is
no endpoint where it was forgotten.

| Organization role | Project membership | Result |
| --- | --- | --- |
| Owner or Admin | none | Reaches the project, with full project rights |
| Owner or Admin | Admin / Editor / Viewer | Reaches the project; the project role does not restrict them |
| Member | Admin / Editor / Viewer | Reaches that project only — and with full rights on it, whichever role they hold |
| Member | none | Does not reach the project at all |
| none | any | Does not reach the project at all |

:::danger Nobody is limited by a project role
Giving somebody the *Viewer* role on a project does not make them read-only — not an organization
admin, and not a plain member either. The single gate that authorizes every project write asks
whether you are a member, never which role you hold, so anyone who reaches a project can rename it,
invite to it and delete it. An organization admin reaches every project of the organization on top of
that, without being invited.

The only boundary that holds is reachability: keep somebody out of the organization, or out of the
project, if they must not change it. Read-only access does not exist yet.
:::

## Pending invitations are not memberships

At both levels, an invitation waiting for an answer grants nothing. The row exists — it is what the
pending invitations table lists, and what lets the invitation be resent or revoked — but until it is
accepted it does not make its holder a member. The consequences are worth spelling out:

- an invited user does not appear among the members, and is not counted in the member total;
- an invited user's organizations list does not contain the organization: the invitation is offered
  as accept-or-decline instead, on the organization selection screen and in the switcher dialog;
- an unanswered invitation to *own* an organization does not already hand over its projects.

Invitations expire **5 days** after they are sent. An expired invitation can no longer be accepted;
it can still be dismissed, and an admin can send a fresh one.

## Inviting to a project creates a membership in the organization

A project sits inside an organization, so somebody invited to a project has to belong to that
organization too — otherwise they would accept an invitation into a tenant they are not part of.

Inviting a collaborator to a project therefore also adds them to the owning organization, as a
**plain member, already accepted**. Creating it accepted is deliberate: it avoids keeping two
invitation tokens in sync, and a plain membership grants nothing on its own — the project invitation
they still have to answer is what actually gives them something.

Two safeguards apply:

- somebody who **already holds a role** in that organization keeps it. A project invitation never
  quietly demotes an admin to member.
- **declining** the project invitation takes the implicit membership back, provided the user has no
  other project in that organization and holds no role of their own there. The same clean-up runs
  when a project invitation that was never accepted is revoked, and the account itself is deleted if
  it only ever existed to be invited.

:::info A removed member stays in the organization
Removing somebody from a project after they accepted does **not** remove them from the organization:
they stay as a plain member with no project, which is what the members table shows as *0 projects*.
Take them out of the organization as well if you want them gone entirely.
:::

## Removing somebody from the organization

Removing a member of the organization also removes them from **every project of that organization**.
Leaving the project rows behind would keep granting access to data inside a tenant the person no
longer belongs to, so the two are done together and cannot be separated.

Their account, and their membership of projects in *other* organizations, are untouched.

## Relation to project roles

The project-level roles — Admin, Editor, Viewer — are documented in
[Project members and roles](../project-settings/users-and-roles.md). Read the two levels this way:

> The organization role answers *which projects*. Project membership answers *whether this one* — and
> nothing yet answers *what, inside it*.

For machine access, [API keys](../ci-cd/api-keys.md) are project-scoped and unaffected by
organization membership. They record a role, but it is not enforced either, and neither is their
expiry — see [API keys](../ci-cd/api-keys.md).
