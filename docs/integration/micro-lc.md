---
sidebar_position: 6
title: micro-lc
sidebar_label: micro-lc
description: Wire an MFE Orchestrator deployment into a micro-lc shell, with the files the Integration page generates for the shell and for each parcel.
keywords: [micro-lc, parcel, qiankun, shell, integration]
---

# micro-lc

[micro-lc](https://micro-lc.io) is an integration model, not a bundler: there is no Module Federation
here. A **shell** hands micro-lc a configuration, and each remote is a **parcel**, one self-contained
UMD script that micro-lc evaluates in a sandbox. MFE Orchestrator generates the shell's configuration
and the build that turns a remote into a parcel. This is the setup used by the micro-lc React templates
in the [templates library](../templates/templates-library.md).

## Configure the shell

Open **Integration → Frontend Integration**, select your host, set **Bundler** to micro-lc (or leave it
on Automatic if that is the microfrontend's stored stack) and copy the **Module Federation** tab. It
shows the file that builds the micro-lc configuration, the bootstrap for your entry point and how React
is shared.

```ts
// src/microlc-config.ts
import { remoteUrl } from '@mfe-orchestrator-hub/client'
import type { Config } from '@micro-lc/interfaces/v2'

export async function buildMicrolcConfig(): Promise<Config> {
  return {
    version: 2,
    settings: { defaultUrl: './catalog/' },
    applications: {
      'catalog': {
        integrationMode: 'parcel',
        route: './catalog/',
        entry: { scripts: [await remoteUrl('catalog')] }
      }
    }
  }
}
```

The configuration is built at runtime rather than written as a static `config.json`: each parcel's
entry is the URL the [serve API](./serve-api.md) resolves for its slug, already pinned to the version
(stable or [canary](../microfrontends/canary-releases.md)) this browser must get. There is one entry
per child of the selected host in the relation graph.

Two things you have to do yourself:

```bash
npm install @micro-lc/orchestrator @mfe-orchestrator-hub/client
```

(plus `@micro-lc/interfaces` for the types) and paste the commented-out bootstrap at the very top of
`src/main.tsx`, so `configure()` runs before anything asks for a URL. It then mounts micro-lc:

```ts
import './shared-react'
import { buildMicrolcConfig } from './microlc-config'

const mountPoint = document.getElementById('microlc') as HTMLElement
const config = await buildMicrolcConfig()
await customElements.whenDefined('micro-lc')
mountPoint.innerHTML = '<micro-lc></micro-lc>'
;(mountPoint.firstElementChild as HTMLElementTagNameMap['micro-lc']).config = config
```

The `<micro-lc>` element is created through markup, not `document.createElement()`, because micro-lc's
constructor appends children; setting `config` in the same task makes it render once.

## Share React through window globals

A sandboxed UMD parcel cannot import modules, but reads that miss its sandbox fall through to the real
window. The shell publishes its React there, in `src/shared-react.ts`, imported before micro-lc mounts
anything:

```ts
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as ReactJSXRuntime from 'react/jsx-runtime'

window.React = React
window.ReactDOM = { ...ReactDOM, ...ReactDOMClient }
window.ReactJSXRuntime = ReactJSXRuntime
```

That is a contract with every parcel: rename one of the three globals and every parcel breaks.

## Configure a remote

A remote of this stack gets a UMD library build, because micro-lc only evaluates classic scripts
exporting `bootstrap`, `mount` and `unmount`:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const reactGlobals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/client': 'ReactDOM',
  'react/jsx-runtime': 'ReactJSXRuntime'
}

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/parcel.tsx',
      name: 'catalog',
      formats: ['umd'],
      fileName: () => 'parcel.js'
    },
    rolldownOptions: {
      external: Object.keys(reactGlobals),
      output: { globals: reactGlobals }
    }
  }
})
```

The output is one file, `dist/parcel.js`, with no chunks and no separate CSS: siblings would be
requested from the shell's origin. It is the file MFE Orchestrator serves, so set the microfrontend's
**Entry Point** to `parcel.js`. Templates already set it for you. `name` is the UMD global, derived from
the microfrontend's slug, and it stays inside the parcel's sandbox.

## Let the console write it

**Integrate my microfrontends** (or **Integrate only this one**) writes `src/microlc-config.ts` into the
shell's repository and adds `@micro-lc/orchestrator` to its `package.json`, as described in
[Integration overview](./overview.md#writing-the-integration-into-your-repositories).
