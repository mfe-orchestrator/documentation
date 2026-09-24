---
sidebar_position: 7
title: Encryption of stored credentials
sidebar_label: Encryption at rest
description: "What SECRETS_ENCRYPTION_KEY encrypts and what it deliberately does not: the threat model, the covered fields, and what losing the key costs you."
keywords: [encryption, secrets, SECRETS_ENCRYPTION_KEY, credentials, security, threat model]
---

# Encryption of stored credentials

The console keeps credentials on behalf of a project: the keys of a bucket, an Azure connection
string, a Google service account file, the token of a code repository. It has to — a pipeline
uploading a bundle at three in the morning needs them and nobody is there to type them.

Set `SECRETS_ENCRYPTION_KEY` and they are encrypted in the database with AES-256-GCM, and no longer
returned by the API.

```bash
# 32 bytes, base64 or hex
openssl rand -base64 32
```

```bash
SECRETS_ENCRYPTION_KEY=<the generated key>
```

Nothing else has to be done. At the next boot a migration rewrites, encrypted, whatever was written
before the key existed. It is a re-save per document and it skips what is already encrypted, so
running it again costs one empty query per collection.

Leave the variable unset and everything still works, unencrypted — the startup log says so in one
line every time the process comes up.

## What this protects against, and what it does not

**Protected — whoever reads the database.** A dump, a backup, a hosted Mongo somebody else operates,
a support engineer with a shell on the replica: they see ciphertext, and the key is not in there with
it.

**Not protected — whoever controls the process.** The backend has to decrypt those values to talk to
S3 or to GitHub in a deploy nobody is watching, so the key is necessarily within reach of anybody
holding the environment of the application. Application-level encryption cannot change that, and no
setting here will.

To narrow that second case the decrypt has to become a remote, authenticated call — AWS KMS, Azure
Key Vault, HashiCorp Vault. Whoever holds the credentials of the application can still ask for a
decrypt, but they cannot walk off with a dump and read it offline, and every decrypt lands in an
audit log you can revoke. The stored format carries a `v1` marker precisely so that scheme can be
introduced beside this one without rewriting a single value.

The alternative that does protect fully — a passphrase held by a person and never stored — is
incompatible with what this product does: without somebody there to unlock it, no pipeline could
upload a bundle.

## What is covered

| Where | Fields |
| --- | --- |
| `storages` | `secretAccessKey`, `accountKey`, `connectionString`, `clientSecret`, `jsonKey` |
| `coderepositories` | `accessToken`, `refreshToken` |
| `deployments` | the same storage fields, inside the snapshot a deployment freezes |

Deployments are on the list because a deployment copies the storages of its project, credentials
included, and the [serve API](../integration/serve-api.md) reads the bucket keys from that copy.
Encrypting the `storages` collection alone would leave every key of every past deployment in the
clear right next to it.

What is deliberately left readable is what **names** a resource rather than what proves you may use
it: bucket, container, region, account name, tenant and client id. The
[storages list](../buckets/overview.md) needs them to tell one storage from another, and none of them
is usable on its own.

:::caution Global variables are not encrypted, and are not secrets
[Environment variables](../environments/environment-variables.md) marked as global are served to
**every browser that loads your application**, as `window.globalConfig`. That is the whole point of
them: they are how a microfrontend learns which API base URL to call.

They are not covered here, and encrypting them would change nothing — anybody who can open your site
can read them from the page. Anything genuinely secret does not belong in a global variable in the
first place, whatever this key is set to.
:::

## In the API

The credentials are no longer returned. Where one would be, the API sends `••••••••••••`, and a field
that comes back exactly as that placeholder is understood as *not retyped*: the stored value is kept.
That is what lets the edit forms keep working — they submit every field, including the ones they never
received.

The visible consequence is on the Azure and GitLab screens: **Test connection** on an existing
connection sends the id of the repository instead of a token, and the backend uses the one it holds.

## Rotating or losing the key

There is no rotation procedure yet. What the format allows is introducing a `v2` alongside `v1`, so
values keep being readable while new writes use the new scheme.

:::danger Losing the key means losing the credentials
A value encrypted with a key you no longer have cannot be read back. The application says so
explicitly at the first read, rather than behaving as though the storage were misconfigured, and
recovering means retyping the credentials in the console.

**Back the key up separately from the database.** A backup holding both protects nothing — it is the
dump and the key in the same place, which is the case this feature exists to prevent.
:::

Two failure modes worth knowing before they happen:

- **The key is removed while encrypted values are in the database.** The application starts normally
  and fails on the first credential it touches.
- **The key is the wrong length.** The boot stops instead, printing the command that generates a
  correct one.
