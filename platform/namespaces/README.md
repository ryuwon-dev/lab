# namespaces

Kubernetes namespace declarations live here.

Namespaces should be created through GitOps before workloads depend on them.

User-facing workloads currently get their own namespace instead of sharing a
catch-all namespace.
