---
sidebar_position: 1
title: Microfrontend templates library
sidebar_label: Templates library
description: "The catalogue of working Module Federation projects you pick from when creating a microfrontend: build config, a sample exposed component and a matching CI pipeline."
keywords: [templates, module federation, scaffolding, vite, webpack]
---

# Microfrontend templates library

The templates library is the catalogue you pick from when creating a microfrontend. A template is a
working Module Federation project — correct build configuration, a sample exposed component, and a
matching CI pipeline — so a new microfrontend is deployable within minutes rather than after an
afternoon of bundler archaeology.

## What the catalogue covers

Fourteen templates, and every one of them is selectable — nothing in the catalogue is marked *Coming
Soon* any more.

The bulk of it is a full grid: **React, Vue and Angular**, each in a **Vite** and a **Webpack**
flavour, each as a **host** and as a **remote**. Pick your framework and your bundler and the pair
exists.

Beyond the grid there is a **Web Component** host and remote for React, for the case where you would
rather expose a custom element than a federated module and let any framework — or none — mount it.

## Browsing

The library opens automatically when you click **Add New Microfrontend**. You can filter by:

- **Framework** — React, Vue, Angular
- **Compiler** — Vite, Webpack, Web Component
- **Host type** — host or remote
- **Free text** search by name

Each card links to the template's repository via **View on GitHub**, so you can read exactly what
you are about to get before committing to it.

## Host versus remote templates

Templates come in pairs, and picking the wrong one is the most common early mistake:

| Template type | Use for |
| --- | --- |
| **host** | The shell application — boots the page, owns routing, loads remotes |
| **remote** | A microfrontend consumed by a host |

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
already integrated, in both places it has to be.

Its federation config declares remotes in the promise form, so the URL is asked for at import time
rather than compiled in — shown here in its Vite flavour, with Webpack using
`promise import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))` instead:

```js
remotes: {
  'catalog': {
    external: `import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`,
    externalType: 'promise'
  }
}
```

and its entry point calls `configure()` before anything imports a remote:

```js
// src/main.js
import { configure } from '@mfe-orchestrator-hub/client'

configure({
  backendUrl: import.meta.env.VITE_MFE_BACKEND_URL,
  projectId: import.meta.env.VITE_MFE_PROJECT_ID,
  environment: import.meta.env.VITE_MFE_ENVIRONMENT   // optional
})
```

So a host scaffolded from a template already resolves its remotes through MFE Orchestrator, already
honours [canary releases](../microfrontends/canary-releases.md), and needs only its environment
variables filled in. Starting a host from scratch means doing both of those by hand — see
[Client SDK](../integration/client-sdk.md).

Only the first two are required. `VITE_MFE_ENVIRONMENT` can be left unset, in which case the SDK
lets the server resolve the environment from the domain the page is served on — convenient when the
same build goes to every stage, provided each stage's domain is registered under
[allowed domains](../environments/domains.md). Templates ship the variable because being explicit is
the safer default to hand someone on day one; see
[leaving the environment out](../integration/client-sdk.md#leaving-the-environment-out) before you
remove it.

## What gets added on top

When you create a microfrontend from a template, MFE Orchestrator does more than copy files. It also:

1. Creates the repository in your connected provider
2. Injects a **build-and-deploy pipeline** for that provider and compiler, pre-filled with your
   microfrontend's slug and this installation's API URL
3. Creates an **API key** and stores it as the repository secret
   `MICROFRONTEND_ORCHESTRATOR_API_KEY`
4. Adds a Dependabot configuration (GitHub)
5. Registers the microfrontend in your project, linked to the new repository

The result is a repository where pushing a tag builds and publishes a version, with nothing left to
wire up. See [Create a microfrontend](../microfrontends/create-a-microfrontend.md).

## Create from scratch

**Create From Scratch** in the library skips the template and registers a microfrontend against
code you already have. You then choose the hosting type yourself and arrange builds and uploads —
see [Versions and builds](../microfrontends/versions-and-builds.md).

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
  "description": "Template for remote microfrontends using Vite",
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

1. Publish a repository containing a working Module Federation project, with the entry point and
   build settings correct for its compiler.
2. Open a pull request against
   [`mfe-orchestrator/documentation`](https://github.com/mfe-orchestrator/documentation) adding an
   entry to `marketplace/marketplace.json`.
3. If your `type`/`compiler` combination is new, also contribute the matching pipelines to
   [`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines).

Set `comingSoon: true` while a template is still being prepared — it appears in the catalogue,
badged, and cannot be selected.
