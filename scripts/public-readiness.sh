#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

fail() {
  printf 'public-readiness failed: %s\n' "$1" >&2
  exit 1
}

scan_repo() {
  local pattern="$1"

  find . \
    -path './.git' -prune -o \
    -path './scripts/public-readiness.sh' -prune -o \
    -type f -print0 | xargs -0 grep -nIE "$pattern"
}

test -f README.md || fail "README.md is missing"
test -f LICENSE || fail "LICENSE is missing"
test -d platform || fail "platform directory is missing"
test ! -d docs || fail "lab/docs must not exist"

grep -q 'MIT License' LICENSE || fail "LICENSE must contain MIT License"
grep -q 'lab.ryuwon.me' README.md || fail "README must mention lab.ryuwon.me"
grep -q 'argo.ryuwon.me' README.md || fail "README must mention argo.ryuwon.me"
grep -q 'auth.ryuwon.me' README.md || fail "README must mention auth.ryuwon.me"
grep -q 'n8n.ryuwon.me' README.md || fail "README must mention n8n.ryuwon.me"
grep -q 'pmh-only/lab' README.md || fail "README must credit pmh-only/lab"

if scan_repo 'BEGIN (RSA|DSA|EC|OPENSSH|PGP|PR[I]VATE) K[E]Y|ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|xox[baprs]-|AKIA[0-9A-Z]{16}|oci[d]1\.'; then
  fail "secret-like token or OCI OCID found"
fi

if find . -path './.git' -prune -o -type f \( \
  -name '*.pem' -o -name '*.key' -o -name '*kubeconfig*' -o -name '*backup*' \
  -o -name '*.dump' -o -name '*.log' -o -name '*.env' \
  \) -print | grep -q .; then
  find . -path './.git' -prune -o -type f \( \
    -name '*.pem' -o -name '*.key' -o -name '*kubeconfig*' -o -name '*backup*' \
    -o -name '*.dump' -o -name '*.log' -o -name '*.env' \
    \) -print >&2
  fail "sensitive local artifact filename found"
fi

if scan_repo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b'; then
  fail "raw IPv4 address found"
fi

if grep -nE '[A-Za-z0-9_-]+@[-.=<>]' README.md; then
  fail "README Mermaid uses edge-id syntax; keep GitHub README diagrams portable"
fi

if grep -nF '@{ animate:' README.md; then
  fail "README Mermaid uses edge-id or animation syntax; keep GitHub README diagrams portable"
fi

if grep -RInE 'rhysd/actionlint@' .github/workflows; then
  fail "actionlint must be installed as CLI, not referenced as a GitHub Action"
fi

if grep -RInE 'uses:[[:space:]]+actions/checkout@v|uses:[[:space:]]+azure/setup-kubectl@v' .github/workflows; then
  fail "GitHub Actions must be pinned to commit SHA, not major version tags"
fi

if grep -RInE 'docker://[^ @]+:[^ @]+' .github/workflows; then
  fail "Docker-based workflow steps must be pinned by digest, not mutable tags"
fi

if grep -RInE 'raw.githubusercontent.com/rhysd/actionlint/main' .github/workflows; then
  fail "actionlint download script must be pinned to a commit SHA"
fi

if grep -nE 'level:[[:space:]]*disable' .yamllint.yaml; then
  fail "yamllint disable syntax is invalid; use rule: disable"
fi

printf 'public-readiness-ok\n'
