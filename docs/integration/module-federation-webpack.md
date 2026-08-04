---
sidebar_position: 3
title: Module Federation with Webpack
sidebar_label: Webpack
description: Wire an MFE Orchestrator deployment into a Webpack 5 host with ModuleFederationPlugin, using the configuration the console generates.
keywords: [webpack, module federation, ModuleFederationPlugin, remotes, host]
---

# Module Federation with Webpack

MFE Orchestrator generates configuration for Webpack 5's built-in
`ModuleFederationPlugin`. No extra dependency is needed — Module Federation ships with Webpack 5.

## Configure a remote

A remote declares what it exposes; this is plain Module Federation with no MFE Orchestrator
involvement:

```js
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  // ... other webpack config
  plugins: [
    new ModuleFederationPlugin({
      name: 'catalog',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './Button': './src/components/Button'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' }
      },
    }),
  ],
};
```

Webpack writes `remoteEntry.js` to the root of your output directory, so the microfrontend's
**Entry Point** in MFE Orchestrator stays at the default of `remoteEntry.js` — unless you have
customised `output.publicPath` or the filename.

## Configure the host

Open **Integration → Frontend integration**, select your host and copy the **Webpack** tab:

```js
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  // ... other webpack config
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        'catalog': 'catalog@https://console.mfe-orchestrator.dev/api/serve/mfe/files/auto/68f1.../catalog/remoteEntry.js',
        'cart': 'cart@https://console.mfe-orchestrator.dev/api/serve/mfe/files/auto/68f1.../cart/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.15.0',
          eager: true
        }
      },
    }),
  ],
};
```

Note the Webpack remote syntax — `name@url`, not a bare URL, as Vite uses. The generated config
gets this right; it is worth knowing if you edit it by hand.

The URLs contain neither a version nor an environment: both are resolved server-side from the
active deployment. See [Allowed domains](../environments/domains.md).

## Remote names

The remote name is derived from the slug by removing `/` and `-`:

| Slug | Key to import from |
| --- | --- |
| `catalog` | `catalog` |
| `product-catalog` | `productcatalog` |
| `shop/catalog` | `shop_catalog` |

## Consume a remote

```jsx
import React, { Suspense, lazy } from 'react'

const CatalogApp = lazy(() => import('catalog/App'))

export default function App() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <CatalogApp />
    </Suspense>
  )
}
```

## About `eager: true`

The generated host configuration marks shared dependencies as `eager: true`, which bundles them
into the host's initial chunk instead of loading them asynchronously. This trades a larger initial
bundle for a simpler startup: no async boundary is required before your first import.

If you would rather keep the initial bundle small, drop `eager` and wrap your entry point in an
async boundary:

```js
// index.js
import('./bootstrap')
```

```js
// bootstrap.js
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
```

This is the standard Module Federation pattern, and it is what you want in a production host with
a meaningful bundle-size budget.

## Version mismatches

`requiredVersion` with `singleton: true` makes Webpack warn at runtime when a remote wants a
different major version of a shared library than the host provides. Those warnings are worth
taking seriously — a satisfied-but-mismatched React is the source of most confusing microfrontend
bugs. Keep shared library versions aligned across the graph, and upgrade hosts and remotes
together.
