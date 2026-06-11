# n8n

GitOps manifests for the n8n workload.

n8n is exposed through Authentik forward-auth at `n8n.ryuwon.me`. The
forward-auth hook is a compatibility shim, not native n8n SSO, so image bumps
must be tested before promotion.

Required live Secret:

```text
n8n/n8n-secrets
  encryption-key
```

The secret value is not stored in Git. Losing the encryption key can make
stored n8n credentials unrecoverable after a restore.

The current PVC is transitional. Keep durable data placement and restore drills
tracked in the private ops workspace before depending on this workload.
