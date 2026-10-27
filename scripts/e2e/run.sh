#!/usr/bin/env bash
# Runs Playwright in the pinned official image so screenshots render identically on every machine
# and in CI (fontconfig/hinting of the host changes text antialiasing). Inside a container (CI) it
# runs Playwright directly. E2E_HOST=1 forces the host browser; its screenshots will not match the
# committed baselines. Extra arguments go to `playwright test`.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ "${E2E_HOST:-}" = "1" ] || [ -f /.dockerenv ]; then
  exec npx playwright test "$@"
fi

version=$(node -p "require('@playwright/test/package.json').version")
image="mcr.microsoft.com/playwright:v${version}-noble"
exec docker run --rm --init --ipc=host \
  --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI -e PW_PORT \
  -v "$PWD":/work -w /work "$image" \
  npx playwright test "$@"
