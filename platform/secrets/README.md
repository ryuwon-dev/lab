# secrets

Secret GitOps documentation and encrypted Secret manifests live here.

Allowed:

- Secret names and namespaces
- placeholder key names
- SealedSecret manifests after controller key backup is documented

Not allowed:

- raw secret values
- controller private key backups
- kubeconfig
- SSH keys
- provider credentials

## Required Live Secrets

These names are intentionally public. Values are not stored in Git.

| Namespace | Secret | Purpose |
| --- | --- | --- |
| `authentik` | `authentik` | Authentik application secret key |
| `authentik` | `authentik-postgresql` | Authentik PostgreSQL credentials |
| `argocd` | `argocd-oidc-authentik` | Argo CD OIDC client secret |
| `n8n` | `n8n-secrets` | n8n encryption key |
| `portal` | `ghcr-pull-secret` | Optional GHCR pull credential if the portal package remains private |
| `sealed-secrets` | controller key secret | Sealed Secrets controller keypair |

Before migrating real application secrets into SealedSecret manifests:

1. Install the Sealed Secrets controller.
2. Back up the controller key outside Git.
3. Document the controller key restore path in the private ops workspace.
4. Pass a dummy seal/unseal test.
5. Move real app secrets one service at a time.
