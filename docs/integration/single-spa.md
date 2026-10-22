---
sidebar_position: 5
title: single-spa
sidebar_label: single-spa
description: Wire an MFE Orchestrator deployment into a single-spa root config, with the files the Integration page generates for the root config and for each application.
keywords: [single-spa, root config, registerApplication, import map, integration]
---

# single-spa

[single-spa](https://single-spa.js.org) is an integration model, not a bundler: there is no Module
Federation here. A **root config** registers applications, and each application is a native ES module
exporting the `bootstrap`, `mount` and `unmount` lifecycles. MFE Orchestrator generates the file that
registers the applications and the build that turns a remote into one. This is the setup used by the
single-spa React templates in the [templates library](../templates/templates-library.md).

## Configure the root config

Open **Integration → Frontend Integration**, select your host, set **Bundler** to single-spa (or leave
it on Automatic if that is the microfrontend's stored stack) and copy the **Module Federation** tab.
The tab shows no federation config: it shows the file that wires the remotes in, the bootstrap for your
entry point and how React is shared.

```ts
// src/applications.ts
import { remoteUrl } from '@mfe-orchestrator-hub/client'
import { registerApplication } from 'single-spa'

export function registerApplications() {
  registerApplication({
    name: 'catalog',
    app: async () => {
      // Resolve the url first, then import it: Vite wraps every dynamic import in a
      // non-async preload callback, so import(await remoteUrl(...)) breaks the build.
      const url = await remoteUrl('catalog')
      return import(/* @vite-ignore */ url)
    },
    activeWhen: '/catalog'
  })
}
```

There is one `registerApplication()` per child of the selected host in the relation graph, and none of
them holds a URL. `remoteUrl()` asks the [serve API](./serve-api.md) for it, already pinned to the
version (stable or [canary](../microfrontends/canary-releases.md)) this browser must get. A host with
no remotes linked yet gets the same call commented out, ready to adapt.

Two things you have to do yourself:

```bash
npm install single-spa @mfe-orchestrator-hub/client
```

and paste the commented-out bootstrap at the very top of `src/main.tsx`, so `configure()` runs before
anything asks for a URL:

```ts
import { configure } from '@mfe-orchestrator-hub/client'
// ... configure({ backendUrl, projectId, environment }) as in the generated snippet
import { start } from 'single-spa'
import { registerApplications } from './applications'

registerApplications()
start()
```

`backendUrl` and `projectId` are written into the snippet as a `define` block for `vite.config.ts`,
exactly as for the [Vite](./module-federation-vite.md) hosts. `environment` is optional: leave it out
and the environment is resolved from the domain the page is served on.

## Share React with an import map

The applications keep `react`, `react-dom`, `react-dom/client` and `react/jsx-runtime` as bare imports.
The root config answers them with an import map injected at the top of `<head>`, before any module
script, pointing at ES module re-exports of its own React:

```html
<script type="importmap">
{ "imports": {
    "react": "/assets/shared-react-<hash>.js",
    "react-dom": "/assets/shared-react-dom-<hash>.js",
    "react-dom/client": "/assets/shared-react-dom-client-<hash>.js",
    "react/jsx-runtime": "/assets/shared-react-jsx-runtime-<hash>.js"
} }
</script>
```

There is one React for the whole page. A package shared this way must be external in every application,
and a React subpath an application imports must be in the map. The host template builds the map with a
plugin in its `vite.config.ts`.

## Configure a remote

A remote of this stack gets a Vite library build instead of a federation config:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const shared = [/^react($|\/)/, /^react-dom($|\/)/]

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/spa.tsx',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rolldownOptions: {
      external: shared
    }
  }
})
```

`src/spa.tsx` exports the lifecycles, with `single-spa-react` (`npm install single-spa-react`). The
output is `dist/index.js`, a fixed name, and it is the file MFE Orchestrator serves, so set the
microfrontend's **Entry Point** to `index.js`. Lazy chunks are imported relatively, from the versioned
URL. Templates already set the entry point for you.

## Let the console write it

**Integrate my microfrontends** (or **Integrate only this one**) writes `src/applications.ts` into the
root config's repository and adds `single-spa` to its `package.json`, as described in
[Integration overview](./overview.md#writing-the-integration-into-your-repositories).
