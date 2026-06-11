# workloads

Workload manifests live here, grouped by service.

Application source code belongs outside this repository. This repository owns
deployment declarations only.

Stateful workloads should stay conservative. Do not treat a manifest here as
durable until backup and restore notes exist in the private ops workspace.

Current workloads:

- `n8n`: protected automation service with transitional local-path state.
- `portal`: stateless public service directory for `lab.ryuwon.me`.
