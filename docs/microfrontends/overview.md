---
sidebar_position: 1
title: Microfrontends overview
sidebar_label: Overview
description: How the Microfrontends page of the MFE Orchestrator console lists, groups and gives you access to every microfrontend registered in a project.
---

# Microfrontends overview

The **Microfrontends** page is the home screen of the console and the place where you spend
most of your time. It lists every microfrontend registered in the current project, together
with its version, hosting type and whether a canary release is active.

## Host and remote

A microfrontend is registered as one of two types:

| Type | Role |
| --- | --- |
| **Host** | The shell application. It boots the page, owns routing and layout, and loads remotes at runtime. |
| **Remote** | A microfrontend exposed to be consumed by a host. |

A project normally has one host per application and any number of remotes. A remote can itself
be a host of other remotes — the relations form a graph, not just a two-level tree.

Relations are what make the platform useful: once you declare that `checkout` and `catalog` are
children of `shell`, MFE Orchestrator can generate the exact `remotes` configuration `shell`
needs, pointing at the versions that are actually deployed in each environment. See
[Hosts and remotes](./host-and-remotes.md).

## Views

The dashboard offers three ways of looking at the same data, switchable from the top-right
corner:

- **Diagram view** — the microfrontend graph, showing which host loads which remotes. Nodes can
  be dragged; their position and size are saved per microfrontend.
- **Grid view** — a card per microfrontend, showing version, repository, storage and canary
  badges at a glance.
- **Table view** — a dense list, best when a project has many microfrontends.

You can filter the list by free-text search and by status.

## Anatomy of a microfrontend

| Field | Notes |
| --- | --- |
| **Name** | Display name |
| **Slug** | Lowercase, URL-friendly, **unique within the project**. It appears in serve URLs and becomes the Module Federation remote name, so treat it as permanent. |
| **Description** | Free text |
| **Version** | The version currently selected for this microfrontend. Only becomes live when you deploy. |
| **Continuous Deployment** | A flag published to consumers on the serve API, marking this microfrontend as continuously deployed |
| **Hosting type** | Where the files live — see [Hosting options](./hosting-options.md) |
| **Entry Point** | The file a consumer loads. Defaults to `index.js`; Vite Module Federation builds typically use `assets/remoteEntry.js` |
| **Code repository** | Optional link to a GitHub / GitLab / Azure DevOps repository, which enables the **Build** action |
| **Canary** | Optional progressive rollout configuration — see [Canary releases](./canary-releases.md) |

:::caution The slug is part of your public URLs
Changing a slug changes the serve URLs for that microfrontend and the remote name in generated
Module Federation configs. Any host that has not been re-deployed will keep pointing at the old
name. Pick a slug you can live with.
:::

## Where to go next

- [Create a microfrontend](./create-a-microfrontend.md) — from a template or from scratch
- [Hosting options](./hosting-options.md) — hub, your own bucket, or an external URL
- [Versions and builds](./versions-and-builds.md) — how a version gets created and uploaded
- [Hosts and remotes](./host-and-remotes.md) — wiring the graph
- [Canary releases](./canary-releases.md) — progressive rollout
