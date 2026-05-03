#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Sync to GitHub automatically after each merge (runs on post-merge events, not every file save)
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set. GitHub sync skipped." >&2
  exit 1
fi

GITHUB_REPO="${GITHUB_REPO_URL:-https://github.com/vouge2017/ethiogradefirst.git}"
GITHUB_USER="${GITHUB_USER:-vouge2017}"

git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_USER}:${GITHUB_PERSONAL_ACCESS_TOKEN}@${GITHUB_REPO#https://}"
trap 'git remote remove github >/dev/null 2>&1 || true' EXIT

echo "Pushing to GitHub: ${GITHUB_REPO}"
if git push github main --force-with-lease || git push github main --force; then
  echo "GitHub sync successful."
else
  echo "ERROR: GitHub push failed. Check GITHUB_PERSONAL_ACCESS_TOKEN and GITHUB_REPO_URL." >&2
  exit 1
fi
