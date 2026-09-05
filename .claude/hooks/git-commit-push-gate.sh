#!/bin/bash
# PreToolUse hook (Bash matcher): force a real, explicit confirmation for
# `git commit`, and for `git push` UNLESS it directly follows a `git commit`
# that was actually approved and run in this same session within the last
# few minutes (marker written by git-commit-marker.sh, a PostToolUse hook).
#
# Root cause this closes: auto mode's classifier can silently clear a
# commit/push based on loosely-inferred "session intent" (an earlier
# explicit commit request bleeding into a later, unrequested one).
# See feedback_git_commit_push_no_confirm memory (4 prior violations).
#
# `git push` is also hard-blocked (not just confirmed) if `npm run lint` or
# `npm run type-check` fails against the current working tree, so a broken
# push can't slip through on session-momentum confirmation.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
session=$(printf '%s' "$input" | jq -r '.session_id // "nosession"')

commit_re='(^|[;&|]|[[:space:]])git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)'
push_re='(^|[;&|]|[[:space:]])git([[:space:]]+-[^[:space:]]+)*[[:space:]]+push([[:space:]]|$)'
marker="${TMPDIR:-/tmp}/claude-git-commit-approved-${session}"
# How long an approved `git commit` lets a following `git push` ride
# through without its own prompt, in seconds.
window=180

ask() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":%s}}' \
    "$(printf '%s' "$1" | jq -Rs .)"
}

deny() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}' \
    "$(printf '%s' "$1" | jq -Rs .)"
}

# Runs the repo's lint + type-check against the current working tree.
# Prints combined output (tail-truncated) and returns non-zero on failure.
run_push_checks() {
  local project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
  local out status
  out=$(cd "$project_dir" && npm run lint 2>&1)
  status=$?
  if [ "$status" -eq 0 ]; then
    out=$(cd "$project_dir" && npm run type-check 2>&1)
    status=$?
  fi
  if [ "$status" -ne 0 ]; then
    printf '%s' "$out" | tail -c 4000
    return 1
  fi
  return 0
}

if printf '%s' "$cmd" | grep -Eq "$commit_re"; then
  ask 'git commit always requires explicit confirmation. Did the CURRENT user message explicitly ask for a commit/push — not an earlier turn, not "same session momentum"? If not, stop and ask the user first instead of proceeding.'
  exit 0
fi

if printf '%s' "$cmd" | grep -Eq "$push_re"; then
  check_output=$(run_push_checks)
  if [ $? -ne 0 ]; then
    deny "$(printf 'git push blocked: `npm run lint` / `npm run type-check` failed on the current working tree. Fix the errors below, then push again.\n\n%s' "$check_output")"
    exit 0
  fi
  if [ -f "$marker" ]; then
    now=$(date +%s)
    mtime=$(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker" 2>/dev/null || echo 0)
    if [ "$((now - mtime))" -lt "$window" ]; then
      # A commit was approved and run in this session moments ago — let the
      # push proceed through the normal permission flow (no second prompt).
      exit 0
    fi
  fi
  ask 'git push requires explicit confirmation unless it directly follows a git commit you approved in this session. Did the CURRENT user message explicitly ask for a push? If not, stop and ask the user first.'
  exit 0
fi
