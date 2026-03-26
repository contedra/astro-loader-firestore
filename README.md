# @contedra/astro-loader-firestore

Astro Content Layer loader for [Conteditor](https://github.com/CircleAround/conteditor) Firestore.

Loads content from a Conteditor-managed Firestore collection and exposes it through Astro's Content Layer API (v5+).

## Installation

```bash
pnpm add @contedra/astro-loader-firestore
```

## Usage

### 1. Define your content collection

```typescript
// src/content/config.ts
import { defineCollection } from "astro:content";
import { contedraLoader } from "@contedra/astro-loader-firestore";

const blogPosts = defineCollection({
  loader: contedraLoader({
    modelFile: "./models/blog_posts.json",
    firebaseConfig: {
      projectId: "your-project-id",
      credential: "./service-account.json",
    },
  }),
});

export const collections = { blogPosts };
```

### 2. Model JSON format

The loader reads Conteditor model definition JSON files:

```json
{
  "id": "blog_posts",
  "modelName": "blog_posts",
  "properties": [
    { "propertyName": "title", "dataType": "string", "fieldType": { "element": "input" }, "require": true },
    { "propertyName": "content", "dataType": "string", "fieldType": { "element": "markdown" } },
    { "propertyName": "publishedAt", "dataType": "datetime" },
    { "propertyName": "category", "dataType": "relatedOne", "relatedModel": "categories" }
  ]
}
```

### 3. Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `modelFile` | `string` | Yes | Path to the Conteditor model JSON file |
| `firebaseConfig.projectId` | `string` | Yes | Firebase project ID |
| `firebaseConfig.credential` | `string` | Yes | Path to service account JSON |
| `collection` | `string` | No | Firestore collection name (defaults to `modelName`) |
| `bodyField` | `string` | No | Field to map to Astro's `body` (auto-detects `element: "markdown"` fields) |

### 4. Data type mapping

| Conteditor `dataType` | Zod Schema | Description |
|------------------------|------------|-------------|
| `string` | `z.string()` | Plain string |
| `datetime` | `z.coerce.date()` | Firestore Timestamp converted to Date |
| `relatedOne` | `z.string()` | Referenced document ID |
| `relatedMany` | `z.array(z.string())` | Array of referenced document IDs |

## License

MIT
