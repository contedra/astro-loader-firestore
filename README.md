# Contedra Toolkit

Monorepo for the Contedra toolkit — tools for building content-driven sites with Firestore and Astro.

## Packages

| Package | Description |
|---------|-------------|
| [`@contedra/core`](./packages/core) | Core library — Firebase connection, model parsing, and schema generation |
| [`@contedra/astro-loader-firestore`](./packages/astro-loader-firestore) | Astro Content Layer loader for Conteditor Firestore |
| [`@contedra/md-importer`](./packages/md-importer) | CLI tool to import Markdown files + images into Firestore |

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## Versioning

All packages share the same version number. Use the built-in scripts to bump versions:

```bash
# Bump patch version (e.g., 0.1.0 → 0.1.1)
pnpm version:patch

# Bump minor version (e.g., 0.1.0 → 0.2.0)
pnpm version:minor

# Bump major version (e.g., 0.1.0 → 1.0.0)
pnpm version:major
```

After bumping, commit and tag:

```bash
pnpm version:patch   # outputs "v0.1.1"
git add -A && git commit -m "chore: bump to v0.1.1"
git tag v0.1.1 && git push origin main --tags
```

Pushing the tag triggers the [publish workflow](./.github/workflows/publish.yml), which builds and publishes all packages to npm.

## Publishing

Packages are published to npm under the `@contedra` scope via GitHub Actions.
Pushing a version tag (e.g., `v0.1.1`) triggers the [publish workflow](./.github/workflows/publish.yml), which builds and publishes all packages.

## Demo

A demo Astro project is included in the [`demo/`](./demo) directory. See its README for setup instructions.

## License

MIT
