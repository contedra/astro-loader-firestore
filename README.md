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

## Publishing

Packages are published to npm under the `@contedra` scope via GitHub Actions.
To publish, push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

This triggers the [publish workflow](./.github/workflows/publish.yml), which builds and publishes all packages.

## Demo

A demo Astro project is included in the [`demo/`](./demo) directory. See its README for setup instructions.

## License

MIT
