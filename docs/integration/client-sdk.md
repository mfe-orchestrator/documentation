---
sidebar_position: 2
title: The client SDK
sidebar_label: Client SDK
description: Resolve remote URLs at runtime with @mfe-orchestrator-hub/client, the framework-agnostic package the generated bundler configuration delegates to, plus its React, Vue and Angular adapters.
keywords: [client sdk, remoteUrl, configure, module federation, react, vue, angular]
---

# The client SDK

The generated bundler configuration no longer contains a URL. It contains a call into
`@mfe-orchestrator-hub/client`, which asks the serve API for the manifest at import time and hands
back a ready-to-use URL for each remote.

That indirection is the whole point: a URL baked into your host bundle would freeze one version into
it, and a [canary release](../microfrontends/canary-releases.md) could no longer decide which
version this particular browser should get. With the SDK in the middle, the decision stays on the
server and your host stays a single build.

## Packages

| Package | Repository | For |
| --- | --- | --- |
| `@mfe-orchestrator-hub/client` | [`client-core`](https://github.com/mfe-orchestrator/client-core) | Any application — framework agnostic, zero runtime dependencies |
| `@mfe-orchestrator-hub/client-react` | [`client-react`](https://github.com/mfe-orchestrator/client-react) | React ergonomics over the core |
| `@mfe-orchestrator-hub/client-vue` | [`client-vue`](https://github.com/mfe-orchestrator/client-vue) | Vue plugin and composables |
| `@mfe-orchestrator-hub/client-angular` | [`client-angular`](https://github.com/mfe-orchestrator/client-angular) | Angular provider and injectable service |

All four are published at `0.2.1` with npm provenance. The core ships ESM and CJS builds and its own
types; the three adapters depend on it and add ergonomics rather than behaviour — with one deliberate
exception, described under [framework adapters](#the-react-adapter-syncs-the-user-for-you).

:::caution `setUserId()` needs the core at 0.2.0 or later
[`setUserId()`](#changing-the-user-without-a-reload) landed in `@mfe-orchestrator-hub/client` 0.2.0.
Pin an earlier core and the function is not exported at all. The three adapters reach it through a
guarded property access, so they do not crash — they `console.warn` and return, and the user silently
never changes. Ask for `^0.2.0` or later.
:::

```bash
npm install @mfe-orchestrator-hub/client
```

Install it in the **host**. Remotes do not need it — they are loaded, they do not load anything.

## Configure once, at the top of the entry point

This is the block the console emits, commented out, underneath the generated bundler configuration —
reproduced here as it is generated, because two details in it look like clutter and are not:

```ts
// src/main.tsx — the console names your framework's real entry point here
import { configure } from '@mfe-orchestrator-hub/client'

// Optional: leave it unset and the environment is resolved from the domain this
// page is served on, so the same build can run on every environment.
const environment = import.meta.env.VITE_MFE_ENVIRONMENT

configure({
  backendUrl: import.meta.env.VITE_MFE_BACKEND_URL,
  projectId: import.meta.env.VITE_MFE_PROJECT_ID,
  // Only a canary targeted on users reads this, and nothing else can supply it.
  // A getter is resolved right before the request, so an auth round trip is in
  // time; later than that, use setUserId(). Without it those microfrontends
  // serve everyone the stable version.
  // userId: () => auth.currentUser?.id,
  ...(environment ? { environment } : {})
})
```

For a Webpack host the same block reads `process.env.MFE_BACKEND_URL`, `process.env.MFE_PROJECT_ID`
and `process.env.MFE_ENVIRONMENT`, and the entry point it names is `src/index.ts`.

`environment` arrives through a **conditional spread**, not as a plain field. That is not style. There
are two ways for the variable to be unset and they do not look the same in the bundle: missing from
`.env` it arrives as `undefined`, declared with no value it arrives as `''`. And `environment: ''` is
a value the core accepts, logs a warning about, and then ignores in favour of the `auto` routes
anyway. Spreading the key in only when it holds something covers both cases and keeps that warning out
of every build that never set the variable. The host templates do the same, with a `?.trim()` in front
of it — see
[templates library](../templates/templates-library.md#host-templates-come-wired-to-the-sdk).

The commented `userId` line is there because that field is the one no environment variable can fill
in, and leaving it out has a silent outcome rather than a visible one: a
[User canary](../microfrontends/canary-releases.md#who--the-canary-type) simply serves everyone the
stable version.

`configure()` is synchronous, idempotent, and must run **before anything imports a remote** — the
remotes in your federation config call into the SDK the moment they are first imported. It does not
fail politely:

- **A missing or unusable `backendUrl` or `projectId` throws, synchronously, out of `configure()`
  itself.** The message names each option, shows what actually arrived, and prints the call to write.
  Expect this when you write the call by hand, because the generated config supplies both values and
  a hand-written call has to supply them itself.
- **A read that arrives before `configure()` ever ran rejects** with *the client is not configured:
  `remoteUrl("catalog")` was called before configure() ever ran, so neither backendUrl nor projectId
  is known and no manifest can be requested*, followed by the snippet for whichever package you are
  using. Every message from the SDK is prefixed `[@mfe-orchestrator-hub/client]`.

### Configuration

```ts
interface OrchestratorConfig {
  backendUrl: string    // ex. "https://console.mfe-orchestrator.dev/api"
  projectId: string
  environment?: string  // environment slug, ex. "DEV" — omit to resolve it from the domain
  userId?: string | (() => string | undefined | Promise<string | undefined>)
}
```

`backendUrl` and `projectId` are the two the SDK cannot do anything without — and the two you
normally do not supply. The console writes their values into the generated bundler configuration
itself, as a `define` entry for Vite and a `DefinePlugin` entry for Webpack, so the `import.meta.env`
and `process.env` names above are already filled in by the time the bundle runs and **there is no
`.env` to create**. See [Vite](./module-federation-vite.md#configure-the-host) and
[Webpack](./module-federation-webpack.md#configure-the-host) for the block that does it.

The other two options are optional, for quite different reasons.

`userId` is the field the SDK has no way of working out for itself. Pass it — as a value or as a
getter, if the user is not known yet at bootstrap — when you want
[User](../microfrontends/canary-releases.md#who--the-canary-type) canary targeting to work: without
it there is nobody to look up in the enrolment list, so that microfrontend serves everyone the
stable version. A getter is resolved as late as possible, right before the manifest request is
issued, so an auth round trip that finishes after bootstrap is still in time. When the user appears
or changes later than that — a login, a logout, an account switch — use
[`setUserId()`](#changing-the-user-without-a-reload).

### Leaving the environment out

`environment` is optional because the platform already knows how to work out which environment a
browser request belongs to: it matches the domain the request came from against the
[allowed domains](../environments/domains.md) registered on each of the project's environments.
Omitting it makes the SDK call the `auto` form of the serve endpoints and delegate the choice to
that mapping.

The two options are a genuine trade-off rather than an old way and a new way.

Passing the slug is **deterministic**. The environment is in the request path, so the answer cannot
depend on where the page happens to be served from — which is what you want when the environment is
known at build time anyway, when the host runs on a hostname you do not control, or when you are
reproducing a problem and would rather remove a variable than add one.

Omitting it buys you **one artifact for every stage**: no `VITE_MFE_ENVIRONMENT` to set per pipeline,
and the same bundle behaving as DEV on `dev.example.com` and as production on `example.com`. The
price is that resolution now depends on configuration that lives somewhere else. The domain the host
is genuinely served from has to be registered, on the right environment and on exactly one of them.
If it is not — a new vanity domain, a preview URL nobody added to the list, a stage that was stood
up without touching the console — the manifest request fails with a `404` carrying
`code: "ENVIRONMENT_NOT_FOUND"` rather than quietly picking a default, and no remote resolves on that
page. The message spells the situation out: *No environment of project … has "…" among its registered
domains*. See [error responses](./serve-api.md#error-responses).

So: omit it when your stages sit on stable domains you have already declared, and keep the domain
list part of the checklist for standing up a new one. Pass it when you would rather have the answer
fixed in the build than resolved per request.

## The API

```ts
/** Call once, synchronously, before any remote is imported. Idempotent. */
function configure(config: OrchestratorConfig): void

/** Replaces the logged-in user mid-session and drops the memoised manifest. */
function setUserId(userId: OrchestratorConfig['userId']): void

/** The ready-to-use, version-pinned URL of a remote. Awaits the manifest internally. */
function remoteUrl(slug: string): Promise<string>

/** The whole manifest, fetched once and memoised. */
function manifest(): Promise<Manifest>

/** The environment's variables, as a plain object. */
function globalVariables(): Promise<Record<string, string>>

/** The two generated ids, exposed for telemetry and debugging. */
function identities(): { sessionId: string; deviceId: string }
```

`remoteUrl()` takes the microfrontend **slug**, not the federation remote name. Asking for a slug
that is not in the manifest rejects with a message listing the ones that are, which is usually
enough to spot the typo or the missing deployment.

:::caution Use the URL verbatim
`remoteUrl()` returns a URL that may already carry a `_v/<version>/` path segment, pinning the
version this browser is meant to receive. Never rebuild that URL by hand and never strip the
segment: the entry point resolves its chunks relative to the URL it was loaded from, and a
versionless URL can end up mixing two builds in one page. See
[how the version reaches the browser](../microfrontends/canary-releases.md#how-the-version-reaches-the-browser).
:::

### Changing the user without a reload

`configure()` is fixed for the page load: calling it again with a different configuration is ignored
with a warning, because the manifest may already be in flight. The user is the one thing that
legitimately changes while the page is alive, so it has its own call.

:::note A React host needs none of this
`<OrchestratorProvider>` calls `setUserId()` itself whenever the `userId` in its config changes, so
in React the wiring below is already done for you — see
[the React adapter syncs the user for you](#the-react-adapter-syncs-the-user-for-you). Vue and
Angular have no equivalent.
:::

```ts
import { setUserId } from '@mfe-orchestrator-hub/client'

auth.onLogin(user => setUserId(user.id))
auth.onLogout(() => setUserId(undefined))  // no mfeUserId at all — back to the stable version
```

`setUserId()` does what a second `configure()` must not: it drops the memoised manifest, so the next
`remoteUrl()`, `manifest()` or `globalVariables()` asks the server again and is answered for the new
user. Setting the same value again is a no-op, so an auth store may call it on every emission without
costing a request; a getter is always taken as a change, since what it returns is precisely what the
SDK cannot know. A request already in flight is not cancelled — whoever is awaiting it still receives
the manifest of the previous identity — and calling it before `configure()` throws.

:::caution It does not reload the remotes already imported
The federation runtime keeps the container it loaded, so a microfrontend already on the page stays on
the version drawn for the previous user. Only the remotes resolved *after* the call see the new one.
Either mount your remotes behind your own auth guard and set the user before the guard opens — nothing
has resolved yet, so the whole page is decided on the right identity — or reload the page after the
switch when it has to be consistent end to end.
:::

## Identities

On first use the SDK generates two ids with `crypto.randomUUID()` and persists them:

| Id | Storage | Key | Lifetime |
| --- | --- | --- | --- |
| Session id | `sessionStorage` | `mfe-orchestrator.sessionId` | Dies with the browser session |
| Device id | `localStorage` | `mfe-orchestrator.deviceId` | Survives browser restarts |

Both, plus `userId` when you supplied one, are sent as query parameters on the manifest request:

```http
GET {backendUrl}/serve/all/{projectId}/{environment}
    ?mfeSessionId=<uuid>&mfeDeviceId=<uuid>&mfeUserId=<optional>
```

or, when `configure()` was called without an `environment`, the same request against the `auto`
form, which carries no slug and lets the server resolve one from the domain:

```http
GET {backendUrl}/serve/all/auto/{projectId}
    ?mfeSessionId=<uuid>&mfeDeviceId=<uuid>&mfeUserId=<optional>
```

The SDK sends **everything it has** and never tries to guess which one the server will use — that
is what lets you change canary strategy in the console with no host-side change. Storage that throws
(private browsing, storage disabled) falls back to an in-memory id for the lifetime of the page;
nothing escapes the SDK as an exception.

Identities are the reason a canary decision is sticky. They travel in the query string rather than
in a cookie because module scripts are fetched with a fixed `same-origin` credentials mode, so no
cookie of the MFE Orchestrator domain would ever reach the server —
[the details are on the canary page](../microfrontends/canary-releases.md#who--the-canary-type).

## Bundler configuration

The generated `remotes` block references the SDK by **bare specifier**, so it is your own bundler
that resolves it against your `node_modules` and inlines it into your host bundle:

```js
// Vite — @originjs/vite-plugin-federation
remotes: {
  'catalog': {
    external: `import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`,
    externalType: 'promise'
  }
}
```

```js
// Webpack — ModuleFederationPlugin
remotes: {
  'catalog': `promise import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`
}
```

The core is a module-level singleton, so the copy your federation config reaches and the copy your
application code reaches are the same instance, sharing one configuration and one manifest fetch.

Full walkthroughs: [Vite](./module-federation-vite.md) and [Webpack](./module-federation-webpack.md).

## Framework adapters

Ergonomics, with the one exception noted at the end of this section: if you need behaviour they do not
have, it belongs in the core. The object each of them takes is the core's `OrchestratorConfig`, so
`environment` is optional there too and can be left out of the examples below.

```tsx
// React
import { OrchestratorProvider, useRemoteUrl, useGlobalVariables, useManifest } from '@mfe-orchestrator-hub/client-react'

<OrchestratorProvider config={{ backendUrl, projectId, environment }}>
  <App />
</OrchestratorProvider>
```

```ts
// Vue
import { createOrchestrator } from '@mfe-orchestrator-hub/client-vue'

app.use(createOrchestrator({ backendUrl, projectId, environment }))
// then, in a component: useRemoteUrl(slug), useGlobalVariables()
```

```ts
// Angular
import { provideOrchestrator, OrchestratorService } from '@mfe-orchestrator-hub/client-angular'

bootstrapApplication(AppComponent, {
  providers: [provideOrchestrator({ backendUrl, projectId, environment })]
})
```

### What each adapter exports

| | React | Vue | Angular |
| --- | --- | --- | --- |
| Configure | `<OrchestratorProvider config>` | `createOrchestrator(config)` | `provideOrchestrator(config)` |
| Remote URL | `useRemoteUrl(slug)` | `useRemoteUrl(slug)` | `OrchestratorService.remoteUrl(slug)` |
| Variables | `useGlobalVariables()` | `useGlobalVariables()` | `OrchestratorService.globalVariables()` |
| Manifest | `useManifest()` | — | `OrchestratorService.manifest()` |
| Identities | — | — | `OrchestratorService.identities()` |
| Change the user | `setUserId(userId)` | `setUserId(userId)` | `OrchestratorService.setUserId(userId)` |
| Result type | `AsyncState<T>` | `AsyncState<T>` | plain `Promise<T>` |

All three also re-export the core's types (`OrchestratorConfig`, `Manifest`, `Microfrontend`,
`GlobalVariable`, `Identities`), and React and Vue export `AsyncState` as well.

:::caution `useRemoteUrl()` does not return a string
It returns `AsyncState<string>` — `{ data, error, loading }` — and in Vue each of the three is a
`Ref`. Read `data` once `loading` is false; until then it is `undefined`. Passing the hook's return
value straight into an `import()` gets you an object, not a URL.
:::

### The React adapter syncs the user for you

`<OrchestratorProvider>` keeps `config.userId` in step with the core across renders: pass the user
from your auth state and a login, a logout or an account switch reaches the core on its own, through
`setUserId()`. The first render is skipped, because `configure()` has just carried that value itself.

So in a React host the manual wiring described under
[changing the user without a reload](#changing-the-user-without-a-reload) is redundant — change what
you pass to the provider instead. In Vue and Angular you call `setUserId()` yourself.

## What it deliberately does not do

- **One manifest request per page load**, memoised as a promise so concurrent callers share it.
- **No retries.** A network error surfaces as it is. The memo is cleared on failure, so the next
  call tries again — but nothing retries on your behalf, and remotes whose URL never resolved will
  not load on that page.
- **No caching beyond the page**, no service worker, no offline mode.
- **No cookies**, read or written.
- **No decision of its own.** It never parses the version out of a URL, never draws a random number
  and does not know whether a canary exists.

## Without the SDK

You can still call [`/serve/all/...`](./serve-api.md#everything-about-an-environment) yourself and
register remotes by hand, in either addressing form — with the environment slug in the path, or
through `auto` and the domain. If you do, you own the parts the SDK was written for: generating and
persisting the two ids, sending them on every manifest call, and passing the returned `url` through
untouched.
