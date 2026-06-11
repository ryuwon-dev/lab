# projects

Argo CD `AppProject` declarations live here.

The root bootstrap Application may stay in the built-in `default` project so it
can create project policy. Child Applications should use the dedicated
`ryuwon-platform` project.

Current project:

```text
ryuwon-platform
```

The first project version restricts source repositories and target namespaces,
but keeps resource kind allowlists broad enough for Helm-managed platform
components. Tighten resource kind allowlists after the first public cutover.
