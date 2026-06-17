# ingress

Ingress and public/private routing manifests live here.

Traefik is the explicit public ingress controller. It runs two app-node replicas
with host ports `80` and `443`, and uses the non-default `traefik`
IngressClass.

GitOps removal of `ingress-nginx` is not enough by itself. Before declaring a
cutover complete, remove the live nginx leftovers and run
`ops/checks/traefik-live-gate.sh` from the workspace root.

Public Ingress resources should set `ingressClassName: traefik` and keep TLS
certificate ownership on cert-manager with `letsencrypt-http01`.

n8n uses an `ExternalName` service for the Authentik outpost shim, so Traefik
keeps `allowExternalNameServices: true`. Do not add more ExternalName routes
without reviewing why a same-namespace service cannot be used.

Move DNS only after both nodes answer HTTP/HTTPS directly. Cloudflare free DNS
does not provide origin health checks, so avoid leaving multiple public A
records as a substitute for failover.
