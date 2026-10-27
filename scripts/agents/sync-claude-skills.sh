#!/usr/bin/env bash
# Recreate .claude/skills/<name> as relative symlinks to .agents/skills/<name> (single source of truth).
set -euo pipefail
root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$root/.claude/skills"
for link in *; do [ -L "$link" ] && [ ! -e "$link" ] && rm "$link"; done 2>/dev/null || true
for dir in "$root"/.agents/skills/*/; do
  name="$(basename "$dir")"
  ln -sfn "../../.agents/skills/$name" "$name"
done
