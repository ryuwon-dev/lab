# monitoring

Monitoring manifests live here once the minimal observability stack is added.

Use short retention and small resource requests until stateful capacity and
restore drills are ready.

Do not add kube-prometheus-stack, Grafana, Alertmanager, Loki, or long-retention
storage here until the parent workspace monitoring gate is satisfied.

Current status:

```text
no monitoring workload is declared yet
```

Design source:

```text
../docs/MONITORING_MINIMUM.md in the parent workspace
```

Public repo rule:

- Keep only deployable monitoring manifests and short manifest notes here.
- Keep topology history, incident notes, and private endpoint inventories in the
  parent workspace.
