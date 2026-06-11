# applications

Argo CD child `Application` manifests live here.

Start conservative:

- no destructive prune until restore drills pass
- explicit project/source/path per application
- app-by-app sync policy decisions
- child Applications use the `ryuwon-platform` AppProject

Current local workload Applications:

- `n8n`
- `portal`
