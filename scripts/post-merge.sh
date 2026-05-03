#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Sync to GitHub automatically after each merge
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set. GitHub sync skipped." >&2
  exit 1
fi

git remote remove github 2>/dev/null || true
git remote add github "https://vouge2017:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/vouge2017/ethiogradefirst.git"
trap 'git remote remove github >/dev/null 2>&1 || true' EXIT
git push github main
