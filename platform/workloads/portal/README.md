# portal

GitOps manifests for the public `lab.ryuwon.me` service directory.

The portal is served from a ConfigMap using the public nginx unprivileged image.
The public files are copied from the private `portal` source repository after a
private-material scan; the cluster does not need a GHCR credential.

The first cutover keeps Argo CD sync manual. Review the Argo CD diff and sync
`portal` only after the public DNS record exists.
