#!/usr/bin/env bash
# PreToolUse hook (Bash) — blocks commands that could READ, PRINT, or EXFILTRATE secrets.
#
# This is ONE layer of defense (see "11 - Security" in the team notes):
#   * settings.json "deny" blocks the Read TOOL on .env*/secrets/credentials.
#   * .gitignore keeps secrets out of git.
#   * THIS hook blocks Bash commands that would leak secrets another way.
#
# It is intentionally CONSERVATIVE (security > convenience) but uses whole-word reader
# matching so it does NOT block benign commands like `cp .env.example .env.local`,
# `git add .env.example`, or a `git commit` message mentioning env.
# NOTE: a regex filter is not a perfect sandbox — see the note's "residual risks".
#
# exit 2 = block (reason shown to Claude); exit 0 = allow.
set -euo pipefail

payload="$(cat)"

# Extract tool_input.command. If parsing fails, fall back to the raw payload so a
# malformed/nonstandard payload cannot blind the filter (no fail-open).
cmd="$(printf '%s' "$payload" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{process.stdout.write((((JSON.parse(s)||{}).tool_input)||{}).command||"")}catch(e){process.stdout.write("")}})' 2>/dev/null || true)"
target="$cmd"
[ -z "$target" ] && target="$payload"
scan="$(printf '%s' "$target" | tr '[:upper:]' '[:lower:]')"

# Tools that can read/print/transfer a file's contents.
readers='cat|bat|tac|less|more|head|tail|nl|xxd|od|hexdump|strings|awk|sed|grep|egrep|fgrep|cut|rev|sort|uniq|paste|column|fold|expand|comm|join|diff|cmp|base64|base32|tee|tr|dd|mapfile|readarray|open|code|vi|vim|nano|pico|emacs|node|deno|bun|ts-node|python|python3|ruby|perl|php|curl|wget|nc|ncat|scp|rsync|tar|zip|gzip'

# A reader must appear as a WHOLE WORD (preceded by start/non-word, followed by
# whitespace+args) so "comm" in "command", "dd" in "add", "tr" in "string" don't match.
if printf '%s' "$scan" | grep -Eq \
     -e "(^|[^a-z0-9._-])(${readers})[[:space:]]+[^&|;]*\\.env" \
     -e "(^|[^a-z0-9._-])(${readers})[[:space:]]+[^&|;]*(secrets/|credentials|id_rsa|id_ed25519)" \
     -e '<[^&|;]*\.env' \
     -e '(^|[;&|])[[:space:]]*printenv([^a-z]|$)' \
     -e '(^|[;&|])[[:space:]]*env([[:space:]]*($|[|;&]))' \
     -e 'export[[:space:]]+-p' \
     -e '(declare|typeset)[[:space:]]+-p' \
     -e '(^|[;&|])[[:space:]]*set[[:space:]]*($|[|;&])' \
     -e 'git[[:space:]]+add[[:space:]]+(-f|--force)' ; then
  echo "🚫 Blocked by .claude/hooks/block-secret-access.sh: this command could read, print, or exfiltrate secrets (.env files, environment variables, credentials/keys, or force-adding ignored files to git). VroomView never prints secret values — variable NAMES are documented in the team notes; ask the user if you truly need a value." >&2
  exit 2
fi

exit 0
