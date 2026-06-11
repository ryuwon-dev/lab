# security

Kubernetes security policy notes for the public GitOps tree.

Current active policy:

```text
Pod Security Admission warn/audit=restricted on managed namespaces
```

There is intentionally no active `NetworkPolicy` manifest yet.

Reason:

- `ingress-nginx` currently uses `hostNetwork: true`.
- A namespace/pod-based ingress allow policy may not match host-networked
  ingress traffic consistently.
- n8n still needs named egress exceptions before a default egress deny is safe.

Before adding active `NetworkPolicy` resources:

1. Confirm how ingress-nginx traffic appears to workload pods.
2. Decide whether ingress-nginx keeps `hostNetwork`.
3. Add a portal-only ingress policy first.
4. Add n8n ingress policy second.
5. Add egress restrictions only after required destinations are named.
6. Verify from live ingress, pod health probes, and service-to-service calls.
