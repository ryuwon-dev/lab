#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

cleanup_paths=()
cleanup() {
  for path in "${cleanup_paths[@]}"; do
    rm -rf "$path"
  done
}
trap cleanup EXIT

fail() {
  printf 'public-readiness-negative-test failed: %s\n' "$1" >&2
  exit 1
}

expect_gate_failure() {
  local name="$1"
  local expected="$2"
  local payload="$3"
  local tmpdir
  local logdir

  tmpdir="$(mktemp -d .public-readiness-negative.XXXXXX)"
  logdir="$(mktemp -d "${TMPDIR:-/tmp}/public-readiness-negative.XXXXXX")"
  cleanup_paths+=("$tmpdir" "$logdir")

  printf '%s\n' "$payload" > "$tmpdir/sample.txt"

  if bash scripts/public-readiness.sh > "$logdir/stdout" 2> "$logdir/stderr"; then
    fail "$name sample passed unexpectedly"
  fi

  if ! grep -q "$expected" "$logdir/stderr"; then
    cat "$logdir/stderr" >&2
    fail "$name sample failed for an unexpected reason"
  fi

  rm -rf "$tmpdir" "$logdir"
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
