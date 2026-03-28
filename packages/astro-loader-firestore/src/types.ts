import type { FirebaseConfig } from "@contedra/core";

export interface ContedraLoaderConfig {
  /** Path to the Conteditor model JSON file */
  modelFile: string;
  /** Field name to map to Astro's body (auto-detects element:"markdown" if omitted) */
  bodyField?: string;
  /** Firebase configuration */
  firebaseConfig: FirebaseConfig;
  /** Firestore collection name (defaults to modelName) */
  collection?: string;
}
