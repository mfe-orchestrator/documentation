---
sidebar_position: 6
title: Canary releases for microfrontends
sidebar_label: Canary releases
description: Serve a new version of a microfrontend to a fraction of your traffic while everyone else keeps the stable one, with a sticky decision taken entirely server-side.
keywords: [canary release, progressive rollout, traffic split, versions, sticky assignment]
---

# Canary releases for microfrontends

A canary release serves a new version of a microfrontend to a fraction of your traffic while
everyone else keeps the stable one. MFE Orchestrator takes that decision per microfrontend and
entirely server-side: the host page never learns which side of the split it got, and does not need
to.

## Enabling a canary

Open the microfrontend, find **Canary Settings** and turn the switch on. The section then asks for
four things:

| Field | Meaning |
| --- | --- |
| **Canary Percentage** | Share of traffic that should receive the canary, as a slider with 5, 10, 25 and 50 presets |
| **Canary Type** | Which identity the split is computed on — *On Sessions*, *On User* or *Cookie Based* |
| **Deployment Type** | What the canary is — *Based on Version* or *Based on URL* |
| **Canary Version** / **Canary URL** | The target, depending on the deployment type |

Canary configuration is part of the microfrontend, so like everything else it is captured in a
[deployment](../deployments/overview.md) and only becomes live once you deploy. Expanding a
deployment under **Deployments** shows a card per microfrontend with its stable version, the canary
share and the two types — the quickest way to confirm what a deployment will actually do.

## Who — the canary type

Every type is the same bucketing over a different **identity**. The identity travels in the query
string of the calls your host makes to the serve API, and the [client SDK](../integration/client-sdk.md)
generates, persists and sends it for you:

| Canary Type | Identity | Where the host keeps it | Query parameter |
| --- | --- | --- | --- |
| **On Sessions** | The browsing session | `sessionStorage` | `mfeSessionId` |
| **Cookie Based** | The device | `localStorage` (a first-party cookie of your own works just as well) | `mfeDeviceId` |
| **On User** | The logged-in user | Supplied by your application | `mfeUserId` |

The host sends **every identity it holds** and is never told which one was used, nor the
percentage, nor whether a canary exists at all. Switching a microfrontend from one type to another
is therefore a console change only — nothing to redeploy on the host side.

:::info "Cookie Based" does not use a cookie
The name survives from the configuration model, not from the mechanism: **no cookie is involved
anywhere in this feature, and none can be.** Microfrontends are loaded with a cross-site
`import()`, and module scripts are fetched with a fixed `same-origin` credentials mode, so a cookie
belonging to the MFE Orchestrator domain is never attached to those requests and a `Set-Cookie` on
their responses is never stored. This is how module scripts are specified in every browser, not a
Safari or ITP quirk — verified in Chromium with third-party cookies enabled and a
`SameSite=None; Secure` cookie already in the jar. The host page is the only place that can hold
this state, and the URL is the only way to hand it over.

*Cookie Based* means "an identity that outlives the browser session", and `localStorage` is the
obvious place to keep it. If you would rather keep it in a first-party cookie of your own domain,
read it yourself and pass it as `mfeDeviceId`.
:::

## What — the deployment type

| Type | Behaviour |
| --- | --- |
| **Based on Version** | The canary is a different **version** of the same microfrontend, served through its normal hosting configuration |
| **Based on URL** | The canary is a completely separate **URL**, which can point anywhere |

*Based on Version* is the natural choice when the canary is simply the next build. *Based on URL*
is useful when the candidate lives on separate infrastructure — a preview environment, a different
CDN — and you want to send a slice of traffic there without registering it as a version.

## How the split is computed

The decision is **sticky**: there is no server-side state and no random draw per request. The
identity and the microfrontend id are concatenated (`identity:microfrontendId`), hashed with FNV-1a
into one of 100 buckets, and the request gets the canary when `bucket < percentage`.

Three properties follow from that, and they are the reason it is done this way:

- **Stable.** The same identity always lands in the same bucket, so a returning browser stays on
  the side it was on, without anything being stored.
- **Monotonic.** Raising the percentage only ever *adds* browsers to the canary; it never moves one
  back to stable. Measured going from 20% to 40%: zero browsers moved out.
- **Independent per microfrontend.** The microfrontend id is part of the hashed string, so a
  browser can be on the canary of one microfrontend and on the stable version of another. A single
  unlucky user does not get every canary at once.

The distribution is accurate enough to trust the number you type: 25% configured measured 25.1%
actual over 4000 identities.

### When no identity arrives

- **On Sessions** and **Cookie Based** fall back to a plain draw **per page load**. The page load
  itself stays coherent, because the resolved version is pinned into the URL immediately — but the
  next reload draws again. Stickiness is exactly what requires the host to send an identity, which
  is what the SDK is for.
- **On User** does not fall back. Without `mfeUserId` there is nobody to bucket, so every request
  gets the stable version.

## How the version reaches the browser

This is the subtle part, and worth understanding before you debug a rollout.

A canary that rolls out one of *your* versions does **not** change the URL of the microfrontend. The
manifest returns the usual serve URL with the resolved version already pinned into it as a **path
segment**:

```
https://console.mfe-orchestrator.dev/api/serve/mfe/files/auto/68f1…/checkout-new/_v/1.5.0-rc1/assets/remoteEntry.js
```

Use that URL verbatim. Never rebuild it, and never strip the `_v/<version>/` segment.

**Why a path segment and not a query parameter.** The entry point imports its chunks with relative
specifiers (`./chunk.js`), which the browser resolves against the entry point's URL — and that
resolution drops the query string. A version carried in the query would be lost by the first chunk
request.

**Why the URL is pinned up front rather than redirected to.** The entry point of a canary
microfrontend also answers the *versionless* URL with a `302` (uncacheable) to the pinned one, as a
fallback for anyone holding a raw URL. That redirect is enough for an ES module, whose relative
imports resolve against the **post-redirect** URL. It is *not* enough for a classic script:
`document.currentScript.src` is the URL *before* redirects, so a webpack build with
`publicPath: 'auto'` would compute its chunk base from the versionless URL and fetch chunks from a
different version — two builds mixed into one page. Verified in Chromium: the classic script saw
`/mfe/assets/entry.js` while an ES module saw `/mfe/_v/1.5.0-rc1/assets/entry-esm.js`. Pinning the
URL in the manifest removes the redirect from the picture entirely, so both module systems resolve
their chunks on one version.

A **Based on URL** canary is decided in the manifest instead: there is no version of yours to pin,
so the host is simply handed either the canary URL or the stable one.

## Verifying which version a browser got

| Tool | What it does |
| --- | --- |
| `x-mfe-version` response header | Present on every file served for a microfrontend, naming the version those exact bytes came from |
| `?mfeVersion=<version>` query parameter | Forces a specific version, for testing |

`mfeVersion` is accepted only when the value is one of the versions that deployment can serve —
the deployed version or the configured canary version — so it cannot be used to reach an arbitrary
build.

In practice: open the network panel, find the entry point request, and read `x-mfe-version`. That
is the ground truth, and it is the only thing the browser is ever told about the rollout.

## Canary users

For **On User** targeting, an explicit decision for one user on one microfrontend takes precedence
over the percentage, in either direction — it can force a user *onto* the canary or keep them *out*
of it. Everyone else is bucketed by `mfeUserId`, so the choice is stable for that person on any
browser and any device.

Those decisions are stored per deployment and are reached from
**Deployments → ⋯ → View canary users**, but that page still shows a *Coming soon* notice:
enrolment is not yet manageable from the console.

![The Canary Users page showing a Coming soon notice](../assets/canary-users.png)

Until it is, treat **On User** as "a stable split computed on your user id".

## Limits worth knowing

- **Based on URL canaries are not sticky yet.** The identity bucketing runs, but the URL variant
  has no version to pin, so the guarantees above about a coherent page load do not apply to it in
  the same way. Prefer *Based on Version* when you can.
- **Per-user overrides cannot be managed from the console yet** — see above.
- **The manifest is fetched once per page load and is not retried.** If that request fails, the
  remotes of that page load fail with it; the SDK clears its memo so the next call tries again.

## Practical advice

**Pick a percentage you can read.** With a sticky split, the useful question is how many sessions
you need before your dashboards say anything. 5% is a smoke test, 25% is a measurement, 50% is a
decision you have already made. The presets on the slider exist for that reason.

**Roll forward in steps, and lean on monotonicity.** 5 → 10 → 25 → 50 → 100 is safe in a way that
matters: every step keeps the browsers already on the canary where they are and only adds new ones,
so you are never re-running the split on people who have been fine for an hour.

**Roll back by lowering the percentage, not by rewriting the version.** Setting it to 0 and
deploying takes everyone back to the stable version and keeps the canary configuration around for
the next attempt. Turning the switch off does the same, more bluntly. For anything worse than a bad
canary there is [rollback and redeploy](../deployments/rollback-and-redeploy.md).

**Verify with the header, not by counting.** Before you trust a rollout, load the host twice — once
in a normal window and once in a fresh private window — and read `x-mfe-version` on the entry point
of each. Two different values is the split working. Use `?mfeVersion=` when you need to see the
canary on demand rather than by luck.

**Promote by making the canary the version.** Once you are convinced, set the microfrontend's
version to what the canary was pointing at and turn the canary off. Nothing about the URLs your
host holds changes.
