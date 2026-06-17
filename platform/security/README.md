# security

Kubernetes security policy notes for the public GitOps tree.

Current active policy:

```text
Pod Security Admission warn/audit=restricted on managed namespaces
```

There is intentionally no active `NetworkPolicy` manifest yet.

Reason:

- Traefik currently uses `hostPort` for public `80` and `443`.
- A namespace/pod-based ingress allow policy must be checked against host-port
  traffic before enforcement.
- Traefik permits ExternalName services only for the current n8n Authentik
  outpost shim. Treat additional ExternalName routes as a security review item.
- n8n still needs named egress exceptions before a default egress deny is safe.

Before adding active `NetworkPolicy` resources:

1. Confirm how Traefik traffic appears to workload pods.
2. Decide whether Traefik keeps `hostPort`.
3. Add a portal-only ingress policy first.
4. Add n8n ingress policy second.
5. Add egress restrictions only after required destinations are named.
6. Verify from live ingress, pod health probes, and service-to-service calls.
