#!/bin/bash
set -euo pipefail

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.1.1"
  exit 1
fi

pnpm -r exec npm version "$VERSION" --no-git-tag-version
git add -A
git commit -m "v$VERSION"
git tag "v$VERSION"
git push origin main --tags
gh release create "v$VERSION" --generate-notes
