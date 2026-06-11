# lab

Clean public GitOps desired-state repository for the ryuwon homelab.

Argo CD should reconcile Kubernetes desired state from this repository after
the new public-safe tree is ready.

## Node Roles

This public repo records only the minimum public role context needed to
understand scheduling manifests. Workspace planning, topology history, live
operation notes, and recovery procedures stay outside this repository.

```text
ryuwon-core-01   main k3s server + embedded etcd
ryuwon-core-02   k3s server + embedded etcd voter
ryuwon-core-03   k3s server + embedded etcd voter
ryuwon-edge-01   service/edge worker
ryuwon-edge-02   service/edge worker
```

`ryuwon-core-01` is the main core node. Public edge placement on a core node is
transitional only; the target public edge node is `ryuwon-edge-01`.

The Account A core node role names are the intended public operating names.
Private addresses and migration backup details stay in local-only runbooks.

## Repository Boundary

Allowed:

- Kubernetes manifests.
- Argo CD Applications.
- Co-located README files that explain manifest directories.
- Placeholder or encrypted Secret manifests.
- CI checks for manifests and policy.

Not allowed:

- Raw secrets.
- kubeconfig.
- SSH keys.
- OCI credentials.
- Public IP inventories.
- Private IP inventories.
- Backup dumps.
- Local runtime logs or state files.
- General docs, planning notes, topology history, and recovery runbooks.

Workspace-level documentation belongs in the parent workspace `docs/` and
`ops/` directories, not in `lab/docs/`.

## Current Workloads

```text
n8n      protected automation service
portal   public service directory for lab.ryuwon.me
```

The `portal` image is expected at `ghcr.io/ryuwon-dev/portal:main`. Do not sync
the portal Application until that package is public or a reviewed private-image
pull fallback exists. First cutover sync is manual after Argo CD diff review.
