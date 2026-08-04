---
sidebar_position: 2
title: Project members and roles
sidebar_label: Members and roles
---

# Project members and roles

Access to MFE Orchestrator is granted per project. A user can be a member of several projects, with
a different role in each.

Members live under **Settings → Team Members**.

## Roles

| Role in the console | In the API | Can |
| --- | --- | --- |
| **Admin** | `OWNER` | Everything, including inviting members, changing roles and deleting the project |
| **Editor** | `MEMBER` | Manage microfrontends, environments, variables, storages, repositories and deployments |
| **Viewer** | `VIEWER` | Read-only |

If you read the API or the database directly, note that the console labels and the underlying names
differ — `OWNER`/`MEMBER`/`VIEWER` are what you will see there.

### Choosing a role

**Admin** for the people responsible for the project's configuration and membership. Keep the number
small, but never at one — a project whose only Admin leaves the company is awkward to recover.

**Editor** for everyone doing the day-to-day work. Editors can deploy, which is usually what you
want: the ability to ship, and the ability to
[roll back](../deployments/rollback-and-redeploy.md), belong to the same people.

**Viewer** for stakeholders who need to see what is deployed without changing it — support, QA,
management.

:::caution Editors can deploy to production
There is no per-environment permission split: an Editor who can deploy `dev` can deploy `prod`. If
you need production deployments restricted to a smaller group, either keep production in a separate
project, or limit Editor membership and let Admins handle production.
:::

## Inviting a member

1. Go to **Settings → Team Members** and click **Invite user**.
2. Enter their **email address**.
3. Choose a **role**.
4. **Send invitation**.

An email goes out with an invitation link. The invitee follows it, signs in or registers, and joins
the project with the role you chose.

:::info Email delivery is required
Invitations are delivered by email, so the installation needs SMTP configured. On a self-hosted
instance without `EMAIL_SMTP_HOST` set, invitations cannot be sent — see
[Environment Variables](../self-hosting/environment-variables.md).
:::

## Managing invitations

The members list shows pending invitations alongside accepted members, with a **Status** of *Invited*
or *Accepted*, and an expiry date on each pending one.

For a pending invitation you can:

- **Resend** — send the email again, for the classic case of it landing in spam
- **Revoke** — cancel it, so the link no longer works

## Removing a member

Open the member's actions and remove them, confirming by name. They lose access to this project
immediately; their account and their membership of other projects are unaffected.

:::tip Removing a person is not enough
People leaving is also the moment to audit [API keys](../ci-cd/api-keys.md). A key that person
created keeps working after they are removed — keys belong to the project, not to the user who
created one. Revoke any key they were the only consumer of.
:::

## Authentication

How members sign in depends on the installation:

| Method | Notes |
| --- | --- |
| Email and password | Available when embedded login is enabled |
| Google | Available when configured |
| Microsoft Entra ID (Azure) | Available when configured |
| Auth0 | Available when configured |

The hosted console offers email/password and Google. For self-hosted installations, the enabled
providers are whichever you configure — see
[Enable SSO](../self-hosting/enable-sso/Google.md).

Whichever method a user signs in with, their project roles are the same: authentication decides who
they are, project membership decides what they can do.

## Machine access

For CI pipelines and scripts, use [API keys](../ci-cd/api-keys.md) rather than a user account. Keys
carry their own role (`MANAGER` or `VIEWER`), expire on a date you choose, and can be revoked
without touching anyone's login.

Creating a "service user" with a shared password is the anti-pattern here: it cannot be rotated
without coordinating with everyone using it, and it muddies the audit trail.
