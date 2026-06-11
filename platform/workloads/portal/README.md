# portal

GitOps manifests for the public `lab.ryuwon.me` service directory.

The app source and container build workflow live outside this repository in the
`portal` app repo. This directory owns only the Kubernetes desired state.

Expected image:

```text
ghcr.io/ryuwon-dev/portal:main
```

Before syncing this Application, confirm the GHCR package exists and is
pullable by the cluster.

Image pull policy:

- Preferred: make the GHCR package public because the portal image contains no
  secrets.
- If the package remains private, add the fallback in a separate change:
  create or seal a `ghcr-pull-secret` for the `portal` namespace and then wire
  `imagePullSecrets` into the runtime ServiceAccount. The Secret value itself
  must not be stored in Git.

The first cutover keeps Argo CD sync manual. Review the Argo CD diff and sync
`portal` only after the image is pullable.
