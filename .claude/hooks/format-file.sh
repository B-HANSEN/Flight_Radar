#!/bin/bash
# PostToolUse hook (Edit|Write|NotebookEdit matcher): run Prettier on the
# file that was just written.
#
# Scoped to files inside the repo: Edit/Write also touch scratchpad and
# /tmp paths, and there's no reason to run the project formatter on those.
# Prettier's own .prettierignore + --ignore-unknown decide which in-repo
# files actually get rewritten. A Prettier failure is reported on stderr.

project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')

[ -z "$file" ] && exit 0

# Resolve to an absolute path so the in-repo check below is reliable.
case "$file" in
  /*) abs="$file" ;;
  *)  abs="$PWD/$file" ;;
esac

# Skip anything outside the project directory (scratchpad, /tmp, ...).
case "$abs" in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac

[ -f "$abs" ] || exit 0

if ! out=$(cd "$project_dir" && npx prettier --write --ignore-unknown "$abs" 2>&1); then
  printf 'prettier --write failed for %s:\n%s\n' "$file" "$out" >&2
  exit 1
fi

exit 0
