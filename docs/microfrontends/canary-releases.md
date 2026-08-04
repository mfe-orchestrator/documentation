---
sidebar_position: 6
title: Canary releases for microfrontends
sidebar_label: Canary releases
description: Serve a new version of a microfrontend to a fraction of your traffic while everyone else keeps the stable one, without any change to your host application.
keywords: [canary release, progressive rollout, traffic split, versions]
---

# Canary releases for microfrontends

A canary release serves a new version of a microfrontend to a fraction of your traffic while
everyone else keeps the stable one. MFE Orchestrator can do this per microfrontend, without any
change to your host application.

:::warning Experimental
Canary support is still under active development. The session-based distribution works, but
user-based and cookie-based targeting are incomplete — the **Canary Users** page in the console
is explicitly marked *Coming soon*. Treat this feature as experimental and avoid relying on it
for production traffic splitting.
:::

## Enabling a canary

Open the microfrontend, expand **Canary release** and turn on **Enable canary**. You then
configure two independent things: **who** gets the canary, and **what** the canary is.

### Who — the canary type

| Type | Behaviour |
| --- | --- |
| **On sessions** | Each request is assigned to canary or stable according to the configured percentage |
| **On user** | Only users explicitly enrolled in the canary receive it |
| **Cookie based** | Assignment is driven by a cookie, so a returning visitor stays on the same side |

**Percentage** sets the share of traffic that should receive the canary.

### What — the deployment type

| Type | Behaviour |
| --- | --- |
| **Based on version** | The canary is a different **version** of the same microfrontend, resolved through the normal hosting configuration |
| **Based on URL** | The canary is a completely separate **URL**, which can point anywhere |

*Based on version* is the natural choice when the canary is simply the next build. *Based on URL*
is useful when the candidate is deployed on separate infrastructure — a preview environment, a
different CDN — and you want to send a slice of traffic there without registering it as a
version.

Depending on your choice, fill in either **Canary version** or **Canary URL**.

## How it takes effect

Canary configuration is part of the microfrontend, so like everything else it is captured in a
[deployment](../deployments/overview.md) and only becomes live once you deploy.

At request time, when a host asks the serve API for its remotes, each microfrontend with canary
enabled is resolved to either the canary URL or the stable URL. The host receives one URL per
remote and does not know which side of the split it got — no client-side logic is required.

## Canary users

For **On user** targeting, the enrolled users are managed per deployment, from
**Deployments → ⋯ → View canary users**. The page lists the users with access to the canary
version of that deployment.

This page currently shows a *Coming soon* notice: enrolment is not yet manageable from the
console.

## Practical advice

Until the feature stabilises, the most reliable way to do a progressive rollout with MFE
Orchestrator is to lean on environments rather than canaries:

1. Create an environment that mirrors production and point a subset of traffic at it via your
   own routing or DNS.
2. Deploy the candidate there.
3. Promote to production by deploying the same version to the production environment.

This uses only the deployment mechanics, which are fully implemented, and keeps rollback a
single [redeploy](../deployments/rollback-and-redeploy.md) away.
