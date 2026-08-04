---
sidebar_position: 1
---

# Overview

So far everything has happened inside MFE Orchestrator. This section is about the other side:
how your application actually consumes what you deployed.

## The Integration page

**Integration** in the sidebar generates, for the selected environment, exactly the snippets your
project needs — with your project id, environment id and deployment already filled in. It has two
tabs:

| Tab | Contains |
| --- | --- |
| **Frontend integration** | Module Federation configuration for Vite and Webpack, plus a `curl` example |
| **Environment variables** | The snippets for reading runtime configuration in the browser |

The page requires the selected environment to have an active deployment. If it does not, deploy
first — there is nothing to integrate against until then.

Pick the **host** microfrontend from the selector at the top: the generated configuration is
always from the point of view of one host, listing its remotes.

## The two integration models

There are two quite different ways to consume MFE Orchestrator, and the right choice depends on
how dynamic you need to be.

### Build-time configuration

You copy the generated `remotes` block into your bundler configuration and build. The remote
**URLs** come from MFE Orchestrator, but they are baked into your host at build time.

- Simplest to set up; standard Module Federation with no extra runtime code
- The URLs used contain no version numbers — they resolve versions server-side — so bumping a
  remote's version is still just a deployment
- Adding or removing a remote requires a host rebuild

This is what the **Vite** and **Webpack** tabs give you. Start here.

### Runtime discovery

Your host asks the serve API at boot which remotes exist and where they are, then registers them
dynamically.

- Adding a remote to a host needs no host rebuild — just a deployment
- Requires dynamic remote loading in your host, which Module Federation supports but does not do
  for you
- Costs one HTTP request during startup

This is what the `curl` tab hints at: a single call to `/serve/all/...` returns the whole
environment — microfrontends with URLs and versions, plus the environment variables.

Most teams start with build-time configuration and move to runtime discovery when the roster of
remotes starts changing often.

## Inject in Repository

If the host's repository is connected to MFE Orchestrator, the Integration page shows an **Inject
in Repository** button next to the microfrontend selector. It writes the generated configuration
directly into the repository instead of leaving you to copy, paste and commit.

## What the platform serves

Whatever integration model you choose, these are the things your application can ask for — all
from the **active deployment** of the resolved environment:

| Ask | Endpoint family |
| --- | --- |
| Everything about this environment | `/serve/all/...` |
| Just the runtime variables | `/serve/global-variables/...` |
| One microfrontend's URL and version | `/serve/mfe/config/...` |
| A microfrontend's actual files | `/serve/mfe/files/...` |

These endpoints are **public and unauthenticated** — they are meant to be called from browsers.
The complete reference is in [Serve API](./serve-api.md).

## Where to go next

- [Vite](./module-federation-vite.md) — `@originjs/vite-plugin-federation`
- [Webpack](./module-federation-webpack.md) — `ModuleFederationPlugin`
- [Runtime configuration](./runtime-configuration.md) — reading environment variables in the browser
- [Serve API](./serve-api.md) — the full public endpoint reference
