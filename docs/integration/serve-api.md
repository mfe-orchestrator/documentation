---
sidebar_position: 5
title: Serve API reference
sidebar_label: Serve API
---

# Serve API reference

The serve API is the public, unauthenticated surface your applications talk to. Every endpoint
answers from the **active deployment** of the resolved environment.

All examples use `<API_BASE>`:

| Setup | `<API_BASE>` |
| --- | --- |
| Hosted console | `https://console.mfe-orchestrator.dev/api` |
| Self-hosted | `<FRONTEND_URL>/api`, or `BACKEND_URL` if set |

:::info No authentication
These endpoints are public by design — they are called from browsers, where a credential could not
be kept secret anyway. Do not put anything confidential in environment variables. The
[management API](../ci-cd/api-keys.md) is a separate, authenticated surface.
:::

## Addressing an environment

Most endpoints come in two or three flavours, differing only in how the environment is identified:

| Form | Environment resolved from |
| --- | --- |
| `.../<environmentId>` | Explicit object id |
| `.../<projectId>/<environmentSlug>` | Explicit project + slug — more readable, stable |
| `.../auto/...` or `/<mfeId>` | The request's `Referer`, matched against [allowed domains](../environments/domains.md) |

Prefer the slug form in configuration you write by hand, and the `auto` form when you want one
build to work in every environment.

## Everything about an environment

```http
GET <API_BASE>/serve/all/{environmentId}
GET <API_BASE>/serve/all/{projectId}/{environmentSlug}
```

Returns the whole environment in one call: microfrontends with resolved URLs, and variables.

```bash
curl "<API_BASE>/serve/all/68f1a2.../prod"
```

```json
{
  "globalVariables": [
    { "key": "API_URL", "value": "https://api.example.com" }
  ],
  "microfrontends": [
    {
      "url": "https://console.mfe-orchestrator.dev/api/serve/mfe/files/auto/68f1.../catalog/assets/remoteEntry.js",
      "slug": "catalog",
      "name": "Catalog",
      "nameToIntegrate": "catalog",
      "version": "1.4.0",
      "continuousDeployment": false
    }
  ]
}
```

`nameToIntegrate` is the Module Federation remote name — the slug with `/` and `-` stripped. Use it
as the key when registering remotes dynamically.

This is the endpoint to build runtime discovery on: one request at boot gives you the full roster
and the configuration.

## Environment variables

```http
GET <API_BASE>/serve/global-variables/{environmentId}
GET <API_BASE>/serve/global-variables/{projectId}/{environmentSlug}
GET <API_BASE>/serve/global-variables/{environmentId}/index.js
```

The first two return JSON; the third returns JavaScript that assigns `window.globalConfig` and is
served as `application/javascript`, ready for a `<script src>` tag.

See [Runtime configuration](./runtime-configuration.md) for usage.

## One microfrontend's configuration

```http
GET <API_BASE>/serve/mfe/config/{projectId}/{environmentSlug}/{mfeSlug}
GET <API_BASE>/serve/mfe/config/{environmentId}/{mfeSlug}
GET <API_BASE>/serve/mfe/config/{mfeId}          # Referer required
```

Returns a single entry in the same shape as the items in `microfrontends` above — the resolved URL
and the deployed version.

Useful when a host wants to look up one remote lazily rather than fetching the whole environment.

## Microfrontend files

These endpoints stream the actual bundle files, and are what the URLs in your Module Federation
configuration point at.

```http
GET <API_BASE>/serve/mfe/files/{projectId}/{environmentSlug}/{mfeSlug}/{path}
GET <API_BASE>/serve/mfe/files/auto/{projectId}/{mfeSlug}/{path}    # Referer or Host
GET <API_BASE>/serve/mfe/files/{mfeId}/{path}                      # Referer required
```

`{path}` is the file inside the build, for example `assets/remoteEntry.js` or
`assets/index-4f2a.css`.

The platform resolves the version from the active deployment and fetches the bytes according to the
microfrontend's [hosting type](../microfrontends/hosting-options.md) — local disk, your bucket, or
an external URL — then streams them back.

### Headers

| Situation | Headers |
| --- | --- |
| The file is the microfrontend's **entry point** | `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0` |
| Any other file | Cacheable |
| All files | `Cross-Origin-Resource-Policy: cross-origin` |

`Content-Type` is set from the extension for `.js`, `.css`, `.html` and `.xml`.

The entry point being uncacheable is what makes a deployment take effect promptly: browsers
re-fetch it, discover the new hashed chunk names inside, and load those from cache or network as
needed.

## Generated bundler configuration

```http
GET <API_BASE>/serve/code?framework={vite|webpack}&microfrontendId={id}&deploymentId={id}
```

Returns `{ "code": "..." }` containing the generated bundler configuration for that host — the same
text the Integration page displays.

Unlike the rest of this page, this endpoint requires authentication. It is a convenience for
tooling, not something your application calls at runtime.

## Error responses

| Message | Cause |
| --- | --- |
| `Active deployment not found` | The environment has never been deployed, or has no active deployment |
| `Referer not found` | A domain-resolving endpoint was called without a `Referer` header |
| `Environment not found` | The `Referer` matched no environment's allowed domains |
| Entity not found for a slug/id | No such microfrontend or environment, or the microfrontend is absent from the active deployment |

A microfrontend that exists in the project but was added *after* the last deployment falls into the
last row: deploy the environment to include it.

## Building runtime discovery

Putting `/serve/all/...` together with dynamic remote loading:

```js
// bootstrap.js
const env = await fetch(`${API_BASE}/serve/all/${PROJECT_ID}/${ENV_SLUG}`)
  .then(r => r.json())

// runtime configuration
window.globalConfig = Object.fromEntries(
  (env.globalVariables ?? []).map(v => [v.key, v.value])
)

// remotes, keyed by Module Federation name
const remotes = Object.fromEntries(
  (env.microfrontends ?? []).map(m => [m.nameToIntegrate, m.url])
)

// register `remotes` with your Module Federation runtime, then start the app
await import('./App')
```

With this in place, adding a remote to the host is a deployment rather than a release: the roster
is discovered, not compiled in.
