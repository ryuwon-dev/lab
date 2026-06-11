# platform

Argo CD desired state for platform components and workloads.

This tree should contain only public-safe Kubernetes manifests, Argo CD
Applications, placeholder documentation, and encrypted Secret manifests after
the Secret GitOps path is ready.

Do not commit raw secrets, kubeconfig, public/private IP inventories, local
runtime logs, or backup dumps.

## Layout

```text
applications/   Argo CD child Applications
argocd/         Argo CD config that is safe to manage from Git
bootstrap/      manually applied root Application and bootstrap notes
cert-manager/   certificates and ClusterIssuer manifests
ingress/        public/private ingress routing
monitoring/     metrics and dashboards once added
namespaces/     namespace declarations
projects/       Argo CD AppProjects
security/       security policy notes and future policy manifests
secrets/        Secret GitOps documentation and encrypted manifests
workloads/      workload manifests grouped by service
```
