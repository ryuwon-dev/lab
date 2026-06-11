#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

fail() {
  printf 'public-readiness-negative-test failed: %s\n' "$1" >&2
  exit 1
}

expect_gate_failure() {
  local name="$1"
  local expected="$2"
  local payload="$3"
  local tmpdir

  tmpdir="$(mktemp -d .public-readiness-negative.XXXXXX)"
  trap 'rm -rf "$tmpdir"' RETURN

  printf '%s\n' "$payload" > "$tmpdir/sample.txt"

  if bash scripts/public-readiness.sh > "$tmpdir/stdout" 2> "$tmpdir/stderr"; then
    fail "$name sample passed unexpectedly"
  fi

  if ! grep -q "$expected" "$tmpdir/stderr"; then
    cat "$tmpdir/stderr" >&2
    fail "$name sample failed for an unexpected reason"
  fi
}

expect_gate_failure \
  "OCI OCID" \
  "secret-like token or OCI OCID found" \
  "tenant=$(printf 'oci%s' 'd1.tenancy.oc1..example')"

expect_gate_failure \
  "raw IPv4" \
  "raw IPv4 address found" \
  "private_ip=$(printf '10.%s' '0.0.1')"

printf 'public-readiness-negative-test-ok\n'
