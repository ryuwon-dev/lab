# ingress

Ingress and public/private routing manifests live here.

Current public DNS still lands on `ryuwon-core-01`, so `ingress-nginx` is pinned
to the main core node.

`ryuwon-edge` remains the target public edge after DNS, firewall, and ingress
scheduling are moved together.
