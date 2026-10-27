#!/usr/bin/env bash
# Validate shared skills: frontmatter (name matches dir, description present) and
# .claude/skills mirrors .agents/skills exclusively through resolving symlinks.
set -euo pipefail
root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
fail=0
err() { echo "FAIL: $*" >&2; fail=1; }

for dir in "$root"/.agents/skills/*/; do
  name="$(basename "$dir")"
  file="$dir/SKILL.md"
  [ -f "$file" ] || { err "$name: missing SKILL.md"; continue; }
  [ "$(head -1 "$file")" = "---" ] || err "$name: frontmatter must start at line 1"
  fm="$(awk 'NR==1{next} /^---$/{exit} {print}' "$file")"
  fm_name="$(printf '%s\n' "$fm" | sed -n 's/^name: *//p')"
  [ "$fm_name" = "$name" ] || err "$name: frontmatter name '$fm_name' != directory"
  printf '%s\n' "$fm" | grep -q '^description: .\{20,\}' || err "$name: description missing or too short"
  link="$root/.claude/skills/$name"
  if [ ! -L "$link" ]; then err "$name: .claude/skills/$name is not a symlink"
  elif [ "$(readlink "$link")" != "../../.agents/skills/$name" ]; then err "$name: symlink target $(readlink "$link")"
  elif ! cmp -s "$link/SKILL.md" "$file"; then err "$name: symlink does not resolve to source"
  fi
done

for entry in "$root"/.claude/skills/*; do
  [ -e "$entry" ] || [ -L "$entry" ] || continue
  name="$(basename "$entry")"
  [ -d "$root/.agents/skills/$name" ] || err ".claude/skills/$name has no source in .agents/skills"
done

[ "$fail" -eq 0 ] && echo "OK: $(ls -d "$root"/.agents/skills/*/ | wc -l) skills valid and mirrored"
exit "$fail"
