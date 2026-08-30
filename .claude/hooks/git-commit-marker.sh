#!/bin/bash
# PostToolUse hook (Bash matcher): PostToolUse only fires after a tool
# *succeeds*, so a `git commit` command reaching here means it was approved
# and actually created a commit. Drop a short-lived, session-scoped marker
# that git-commit-push-gate.sh reads to let a following `git push` through
# without a second confirmation.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
session=$(printf '%s' "$input" | jq -r '.session_id // "nosession"')

commit_re='(^|[;&|]|[[:space:]])git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)'

if printf '%s' "$cmd" | grep -Eq "$commit_re"; then
  touch "${TMPDIR:-/tmp}/claude-git-commit-approved-${session}"
fi
