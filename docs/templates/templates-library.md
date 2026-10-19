---
sidebar_position: 1
title: Frontend templates library
sidebar_label: Templates library
description: "The catalogue of working frontend projects you pick from when creating a frontend: Module Federation, Web Component, single-spa and micro-lc, each with a matching CI pipeline."
keywords: [templates, module federation, scaffolding, vite, webpack, single-spa, micro-lc]
---

# Frontend templates library

The templates library is the catalogue you pick from when creating a frontend. A template is a
working Module Federation project — correct build configuration, a sample exposed component, and a
matching CI pipeline — so a new frontend is deployable within minutes rather than after an
afternoon of bundler archaeology.

## What the catalogue covers

Eighteen templates, and every one of them is selectable — nothing in the catalogue is marked *Coming
Soon* any more.

The bulk of it is a full grid: **React, Vue and Angular**, each in a **Vite** and a **Webpack**
flavour, each as a **host** and as a **remote**. Pick your framework and your bundler and the pair
exists.

Beyond the grid there is a **Web Component** host and remote for React, for the case where you would
rather expose a custom element than a federated module and let any framework — or none — mount it.

Two more pairs for React use an integration model instead of Module Federation. Both are built with
Vite, and both still resolve every remote URL through the [client SDK](../integration/client-sdk.md):

| Templates | Host | Remote | Remote entry point | React shared through |
| --- | --- | --- | --- | --- |
| **single-spa** (`single-spa-host-react`, `single-spa-remote-react`) | a root config registering applications with `registerApplication()` | a native ES module exporting the lifecycles | `index.js` | an import map the root config generates |
| **micro-lc** (`microlc-host-react`, `microlc-remote-react`) | a micro-lc 2 shell whose config is built at runtime | a UMD parcel | `parcel.js` | `window.React`, `window.ReactDOM`, `window.ReactJSXRuntime` |

A frontend created from one of these remotes is served by the template's entry point
(`index.js`, `parcel.js`) rather than by the generic `assets/remoteEntry.js`.

## Browsing

The library opens automatically when you click **Add New Frontend**. You can filter by:

- **Framework** — React, Vue, Angular
- **Compiler** — Vite, Webpack, Web Component, single-spa, micro-lc
- **Host type** — host or remote
- **Free text** search by name

Each card links to the template's repository via **View on GitHub**, so you can read exactly what
you are about to get before committing to it.

## Host versus remote templates

Templates come in pairs, and picking the wrong one is the most common early mistake:

| Template type | Use for |
| --- | --- |
| **host** | The shell application — boots the page, owns routing, loads remotes |
| **remote** | A frontend consumed by a host |

A typical project starts with one host template and then adds remote templates as features are
carved out.

## What a template gives you

Taking the Vite + React remote template as the example:

```
├── index.html
├── package.json
├── vite.config.js          ← Module Federation configured
├── public/
└── src/
    ├── App.jsx
    ├── main.jsx
    └── components/
        └── Button.jsx      ← an exposed component
```

The `vite.config.js` is the valuable part:

```js
federation({
  name: "remote_app",
  filename: "remoteEntry.js",
  exposes: {
    './Button': './src/components/Button'
  },
  shared: ['react', 'react-dom']
})
```

together with the build settings Module Federation requires (`target: 'esnext'`,
`minify: false`, `cssCodeSplit: false`). These are easy to get wrong by hand and produce obscure
runtime failures when you do.

### Host templates come wired to the SDK

A host template carries one thing a remote does not: the [client SDK](../integration/client-sdk.md)
already integrated. Every host template calls `configure()` in its entry point. Most, but not all,
also ship an example remote declared in the promise form, so the URL is asked for at import time
rather than compiled in — shown here in its Vite flavour, with Webpack using
`promise globalThis.__MFE_ORCHESTRATOR__.loadWebpackRemote('catalog', 'catalog')` instead:

```js
remotes: {
  'catalog': {
    external: `import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`,
    externalType: 'promise'
  }
}
```

How much of that a host template ships varies, so read its config before copying from it:

| Host template | Federation config as shipped |
| --- | --- |
| Vite + Vue | A live `remoteUrl()` entry for `example-remote` |
| Vite + Angular | A live `remoteUrl()` entry for `example-remote` |
| Webpack + Vue | A live `remoteUrl()` entry for `example-remote` |
| Webpack + Angular | A live `remoteUrl()` entry for `example-remote` |
| Vite + React | The `remoteUrl()` entry, commented out — uncomment and rename it |
| Webpack + React | A stale `name@url` example, commented out, and an empty `exposes` |
| Web Component + React | **No federation plugin at all** |
| single-spa + React | No federation: `src/applications.ts` registers `example-remote`, loaded with `import()` of its `remoteUrl()` |
| micro-lc + React | No federation: `src/microlc-config.ts` builds the micro-lc config with `entry: { scripts: [remoteUrl] }` |

The Webpack + React host is the one to check: its commented example is the static
`remote1@http://localhost:3001/remoteEntry.js` form, which is exactly what the SDK exists to avoid.
Replace it with the promise form rather than filling in a URL.

The Web Component host is not a Module Federation project and says so in its `vite.config.ts` — "No
federation plugin here on purpose". It wires the SDK through `src/FrontendLoader.tsx`, which asks
for the resolved URL and mounts the custom element. There is no `remotes` block to write.

The single-spa and micro-lc hosts are not Module Federation projects either.

- **single-spa:** the root config resolves each application's URL first, then imports it on its own
  line: `const url = await remoteUrl('example-remote'); return import(/* @vite-ignore */ url)`. Vite
  wraps dynamic imports in a preload callback that `import(await …)` breaks.
- **micro-lc:** the shell hands micro-lc a config whose parcel entries are
  `[await remoteUrl('example-remote')]`.

Both share their React with the remotes, and that is a contract: rename one of the shared names and
every remote breaks. Read the template's README before upgrading React on one side only.

### The shape of the `configure()` call is deliberate

```ts
// src/main.tsx (Vite + React; the other entry points are in the table below)
import { configure } from '@mfe-orchestrator-hub/client'

// VITE_MFE_ENVIRONMENT is optional. An unset variable arrives as undefined, one
// declared empty in .env arrives as an empty string, and neither is a usable
// environment slug: in both cases the key is left out of configure() entirely and
// the backend resolves the environment from the domain the request comes from.
const environment = import.meta.env.VITE_MFE_ENVIRONMENT?.trim()

configure({
  backendUrl: import.meta.env.VITE_MFE_BACKEND_URL,
  projectId: import.meta.env.VITE_MFE_PROJECT_ID,
  ...(environment ? { environment } : {})
})
```

:::caution `environment` is spread in, never passed as a plain field
Writing `environment: import.meta.env.VITE_MFE_ENVIRONMENT` is the mistake every template goes out of
its way to avoid. Vite hands an unset variable to the bundle as `undefined` and one declared with no
value as `""`; neither is a usable slug, and `""` reaching the SDK makes the core log a warning and
then fall back to the `auto` routes anyway. The `?.trim()` collapses both to a falsy value and the
conditional spread leaves the key out. The console's generated bootstrap snippet emits the same shape.
:::

The entry point is not `src/main.js` in any of them:

| Host template | Entry point |
| --- | --- |
| Vite + React, Web Component + React, single-spa + React, micro-lc + React | `src/main.tsx` |
| Vite + Vue, Vite + Angular | `src/main.ts` |
| Webpack + React, Vue, Angular | `src/index.ts` |

The Webpack hosts read `process.env.MFE_*` instead of `import.meta.env.VITE_MFE_*`, substituted by
`DefinePlugin` in `webpack.config.ts`; the Webpack + Angular host goes one step further and assembles
the whole configuration object there, passing it as `configure(MFE_ENV)`.

So a host scaffolded from a template already resolves its remotes through MFE Orchestrator and already
honours [canary releases](../frontends/canary-releases.md). Starting a host from scratch means
doing both by hand — see [Client SDK](../integration/client-sdk.md).

Only `backendUrl` and `projectId` are required. The environment slug can be left unset, in which case
the SDK lets the server resolve the environment from the domain the page is served on — convenient
when the same build goes to every stage, provided each stage's domain is registered under
[allowed domains](../environments/domains.md).

The templates do not agree on what to hand you on day one. Of the nine host templates, five ship
the variable empty in `.env.example`, two ship it set to `DEV`, and two ship the line commented out.
None of them defaults the *code* to a slug, and the Webpack + React config says why: defaulting to
`DEV` "silently pinned every build that forgot the variable to the DEV environment". Read
[leaving the environment out](../integration/client-sdk.md#leaving-the-environment-out) and decide per
project rather than following whichever template you happened to pick.

## What gets added on top

When you create a frontend from a template, MFE Orchestrator does more than copy files. It also:

1. Creates the repository in your connected provider
2. Injects a **build-and-deploy pipeline** for that provider and compiler, looked up as
   `<type>/<compiler>/<provider>` in
   [`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines)
3. Registers the frontend in your project, linked to the new repository

The single-spa and micro-lc templates have their own pipeline folders, `single-spa` and `micro-lc`.
Their remotes publish `dist/` like the Vite ones. Their hosts build with `VITE_MFE_BACKEND_URL`,
`VITE_MFE_PROJECT_ID` and `VITE_MFE_ENVIRONMENT`, which you set as CI variables.

The result is a repository where pushing a tag builds and publishes a version. See
[Create a frontend](../frontends/create-a-frontend.md). Three details around it are
worth knowing before you rely on them.

### Placeholders are replaced in the pipeline only

The pipelines carry `%microfrontendSlug%` and `%domain%` placeholders. Both are replaced before the
initial commit, on every provider, with the same values: your frontend's slug, and the base URL
of the console the pipeline publishes to — `BACKEND_URL` when the installation sets it,
`https://console.mfe-orchestrator.dev` otherwise. The pipelines add `/api` to it themselves.

What is copied differs by provider. On GitHub the whole `<type>/<compiler>/github` directory goes
into `.github/`; on **GitLab** and **Azure DevOps** a single file is copied to the repository root
(`.gitlab-ci.yml`, `azure-pipelines.yml`). Only those copied files are touched: a placeholder in the
template's own files is committed as it is.

### Where the API key lives

The pipeline authenticates with an [API key](../ci-cd/api-keys.md) stored under the name
`MICROFRONTEND_ORCHESTRATOR_API_KEY`. Where that secret is created, and when, depends on the provider
and on what kind of connection it is. It is created once and then reused — an existing secret is never
overwritten.

| Connection | Secret created as | When |
| --- | --- | --- |
| GitHub, personal account | A repository secret on the new repository | Creating the frontend |
| GitHub, organization | An organization secret, visible to all repositories | Creating or editing the code-repository connection |
| GitLab, with a group | A group secret | Creating or editing the connection |
| Azure DevOps | A variable in the `MFE_ORCHESTRATOR_SECRETS` variable group | Creating or editing the connection |

:::caution Two kinds of connection get no secret at all
Each injector returns early when the identifier it needs is missing. A **GitLab** connection with no
group id, and an **Azure DevOps** connection missing its organization or project id, have nowhere to
put the secret: nothing is created, no error is raised, and the injected pipeline cannot
authenticate. Create the [API key](../ci-cd/api-keys.md) yourself and add it under that name.
:::

### Dependabot comes from the template, not from the platform

No product code writes a Dependabot configuration. Most host templates carry a
`.github/dependabot.yml` of their own, which is copied along with the rest of the template — but the
Vite + React and Webpack + React hosts do not, so a frontend scaffolded from either of those has
none.

The one thing that could add one anyway is the GitHub branch of the pipeline injection, which copies
an entire directory out of
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines) into `.github/`. If
that repository ships a `dependabot.yml` for a given `type`/`compiler` pair, it lands too. Check the
repository after creation rather than assuming either way.

## Create from scratch

**Create From Scratch** in the library skips the template and registers a frontend against
code you already have. You then choose the hosting type yourself and arrange builds and uploads —
see [Versions and builds](../frontends/versions-and-builds.md).

Note that no pipeline is injected into a repository MFE Orchestrator did not create. To get the same
automation, copy the appropriate file from
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines) and create an
[API key](../ci-cd/api-keys.md) yourself.

## Where templates come from

The catalogue is assembled from a manifest published in the documentation repository:
[`marketplace/marketplace.json`](https://github.com/mfe-orchestrator/documentation/blob/main/marketplace/marketplace.json).
Each entry declares the template's name, framework, compiler, host type, entry point, repository
and download URL.

Because the manifest is fetched at request time, new templates appear in every installation —
hosted and self-hosted alike — without an upgrade.

### Anatomy of a manifest entry

```json
{
  "name": "Vite & React - remote Template",
  "slug": "vite-remote-react",
  "description": "Template for remote frontends using Vite",
  "version": "1.0.0",
  "author": "Lorenzo De Francesco",
  "license": "MIT",
  "repo": "https://github.com/mfe-orchestrator/template-vite-remote",
  "zipUrl": "https://github.com/mfe-orchestrator/template-vite-remote/archive/refs/heads/main.zip",
  "tags": ["template"],
  "type": "remote",
  "entryPoint": "assets/remoteEntry.js",
  "compiler": "vite",
  "framework": "React",
  "icon": "https://…/vite-logo.png"
}
```

The `type` and `compiler` fields do double duty: besides filtering the catalogue, they select which
pipeline is injected, by looking up `<type>/<compiler>/<provider>` in the
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines) repository. A
template whose combination has no pipeline is still usable — the repository is created and the
files pushed — but no CI file is added, and you will need to supply your own.

## Contributing a template

Templates are ordinary Git repositories. To propose one:

1. Publish a repository containing a working frontend project, with the entry point and
   build settings correct for its compiler.
2. Open a pull request against
   [`mfe-orchestrator/documentation`](https://github.com/mfe-orchestrator/documentation) adding an
   entry to `marketplace/marketplace.json`.
3. If your `type`/`compiler` combination is new, also contribute the matching pipelines to
   [`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines).

Set `comingSoon: true` while a template is still being prepared — it appears in the catalogue,
badged, and cannot be selected.
