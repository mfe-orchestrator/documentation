---
sidebar_position: 2
description: Roll back by re-activating a deployment snapshot that already exists — no rebuild, no revert commit, no re-upload — and redeploy when configuration changes.
keywords: [rollback, redeploy, deployment history, snapshot, incident recovery]
---

# Rollback and redeploy

Because deployments are immutable snapshots, rolling back is not a rebuild, a revert commit, or a
re-upload. It is re-activating a snapshot that already exists.

## Rolling back

1. Open **Deployments** and select the affected environment.
2. Find the last known-good deployment in **History**.
3. Expand it and check its microfrontend versions and variables are what you expect.
4. Choose **Redeploy** on that deployment.

**Redeploy** lives on the deployments in **History**, next to **View canary users**. The active
deployment has no Redeploy button — re-activating what is already active would be a no-op.

![An older deployment expanded in History, with its versions, variables and the Redeploy action](../assets/deployments-history.png)

Comparing the two snapshots above is the whole point: `#2` is serving `catalog` at `2.2.0`,
while `#1` — one click away — still holds `2.1.0`.

That deployment becomes active again, the broken one is deactivated, and the serve endpoints
immediately answer from the restored snapshot.

Because the microfrontend entry point is always served with
`Cache-Control: no-cache, no-store, must-revalidate`, browsers pick up the change on their next
request rather than after a cache expiry.

## What a rollback restores

Everything in the snapshot, together:

- Microfrontend versions
- Hosting configuration and entry points
- Canary settings
- Environment variables
- Storage configuration

The **canary enrolment** comes back with it too, but for a different reason: enrolment rows are
stored per deployment, and the one you re-activate still holds its own. That is the list as it was
on that deployment, which is not necessarily the list you had a minute ago — if you enrolled
someone after the deployment you are rolling back to was replaced, check
[canary users](../microfrontends/canary-releases.md#canary-users) afterwards.

This matters when an incident has more than one cause. If a bad release changed both a version
and a feature-flag variable, rolling back the deployment undoes both — you do not have to
remember which variables moved.

## What a rollback does not do

| Not restored | Why |
| --- | --- |
| Your project's draft configuration | The console keeps showing the versions and variables you last selected. Only the *active snapshot* changes |
| Deleted microfrontends | A microfrontend deleted from the project is gone from the project, even if older snapshots mention it |
| Data outside MFE Orchestrator | Database migrations, backend deployments and CDN state are yours to manage |

Point one is a common surprise: after a rollback, the console still shows the version you were
trying to ship, because that is still what you have selected. Reconcile the draft afterwards, or
your next deployment will re-ship the bad version.

:::tip After rolling back
Set the microfrontend's selected version back to the good one straight away. It costs ten seconds
and prevents the next deployment from re-introducing the incident.
:::

## Redeploy does not publish your edits

**Redeploy** re-activates an existing snapshot, with a fresh timestamp, exactly as it was stored.
It never picks up draft changes: a version you selected, a variable you edited or a remote you
rewired since that snapshot was taken are not in it.

To publish edits you want **Deploy**, which takes a new snapshot of the current configuration. The
two buttons sit on different things for that reason — **Deploy** at the top of the page, on the
selected environment, and **Redeploy** inside a deployment of the history.

## Deployment numbering

Numbers are assigned per environment and never reused: `#1`, `#2`, `#3` … A rollback does not
create a new number — it re-activates an existing one. So a history where `#7` is active after
`#9` existed is entirely normal, and tells you at a glance that a rollback happened.

## A rehearsal worth doing

Roll back once in a non-production environment before you need to do it under pressure:

1. Deploy a version, note the deployment number.
2. Bump the version and deploy again.
3. Redeploy the first snapshot and confirm your app serves the old version.

Ten minutes now buys confidence during an incident.
