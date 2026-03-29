import { describe, it, expect } from "vitest";
import path from "node:path";
import {
  extractImageRefs,
  assetStoragePath,
  assetUri,
  replaceImageRefs,
  defaultResolveImage,
  isImagePath,
} from "../images.js";

describe("extractImageRefs", () => {
  it("extracts local image references", () => {
    const body = `
Some text

![hero](./images/hero.png)

More text

![diagram](../assets/diagram.jpg)
`;
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(2);
    expect(refs[0]).toEqual({
      fullMatch: "![hero](./images/hero.png)",
      alt: "hero",
      originalPath: "./images/hero.png",
    });
    expect(refs[1]).toEqual({
      fullMatch: "![diagram](../assets/diagram.jpg)",
      alt: "diagram",
      originalPath: "../assets/diagram.jpg",
    });
  });

  it("skips HTTP URLs", () => {
    const body = "![ext](https://example.com/img.png)";
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(0);
  });

  it("skips asset:// references", () => {
    const body = "![asset](asset://blog_posts/post-1/hero.png)";
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(0);
  });

  it("returns empty array for no images", () => {
    const body = "Just plain text with [a link](https://example.com)";
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(0);
  });

  it("handles images with empty alt text", () => {
    const body = "![](./photo.png)";
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(1);
    expect(refs[0].alt).toBe("");
  });

  it("extracts path without title attribute", () => {
    const body = '![hero](./images/hero.png "Hero Image")';
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(1);
    expect(refs[0].originalPath).toBe("./images/hero.png");
    expect(refs[0].fullMatch).toBe('![hero](./images/hero.png "Hero Image")');
  });

  it("handles mixed images with and without title", () => {
    const body = `
![a](./a.png "Title A")
![b](./b.jpg)
`;
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(2);
    expect(refs[0].originalPath).toBe("./a.png");
    expect(refs[1].originalPath).toBe("./b.jpg");
  });
});

describe("isImagePath", () => {
  it("detects common image extensions", () => {
    expect(isImagePath("./hero.png")).toBe(true);
    expect(isImagePath("/images/photo.jpg")).toBe(true);
    expect(isImagePath("banner.jpeg")).toBe(true);
    expect(isImagePath("icon.gif")).toBe(true);
    expect(isImagePath("photo.webp")).toBe(true);
    expect(isImagePath("logo.svg")).toBe(true);
  });

  it("is case insensitive for extensions", () => {
    expect(isImagePath("photo.PNG")).toBe(true);
    expect(isImagePath("photo.Jpg")).toBe(true);
  });

  it("rejects non-image paths", () => {
    expect(isImagePath("document.pdf")).toBe(false);
    expect(isImagePath("Hello World")).toBe(false);
    expect(isImagePath("some text")).toBe(false);
  });

  it("skips URLs", () => {
    expect(isImagePath("https://example.com/img.png")).toBe(false);
    expect(isImagePath("http://example.com/img.jpg")).toBe(false);
  });

  it("skips asset:// URIs", () => {
    expect(isImagePath("asset://blog/post/hero.png")).toBe(false);
  });
});

describe("assetStoragePath", () => {
  it("generates v2 storage path", () => {
    const result = assetStoragePath("blog_posts", "hello-world", "hero.png");
    expect(result).toBe("assets/blog_posts/hello-world/hero.png");
  });
});

describe("assetUri", () => {
  it("generates v2 asset:// URI", () => {
    const result = assetUri("blog_posts", "hello-world", "hero.png");
    expect(result).toBe("asset://blog_posts/hello-world/hero.png");
  });
});

describe("replaceImageRefs", () => {
  it("replaces image references with asset:// URIs", () => {
    const body =
      "text ![hero](./images/hero.png) more ![diag](./diag.jpg) end";
    const replacements = new Map([
      [
        "![hero](./images/hero.png)",
        "![hero](asset://blog/post-1/hero.png)",
      ],
      [
        "![diag](./diag.jpg)",
        "![diag](asset://blog/post-1/diag.jpg)",
      ],
    ]);

    const result = replaceImageRefs(body, replacements);
    expect(result).toBe(
      "text ![hero](asset://blog/post-1/hero.png) more ![diag](asset://blog/post-1/diag.jpg) end"
    );
  });
});

describe("defaultResolveImage", () => {
  it("extracts absolute path image references", () => {
    const body = "![banner](/images/banner.png)";
    const refs = extractImageRefs(body);
    expect(refs).toHaveLength(1);
    expect(refs[0].originalPath).toBe("/images/banner.png");
  });

  it("resolves absolute paths using imageBaseDir", async () => {
    const { writeFile, mkdir, rm } = await import("node:fs/promises");
    const fixturesDir = path.join(import.meta.dirname, "fixtures");
    const imageBaseDir = path.join(fixturesDir, "_test_public");
    await mkdir(path.join(imageBaseDir, "images"), { recursive: true });
    const testData = Buffer.from("public-dir-image");
    await writeFile(path.join(imageBaseDir, "images", "banner.png"), testData);

    try {
      const result = await defaultResolveImage(
        "/images/banner.png",
        path.join(fixturesDir, "some-post.md"),
        imageBaseDir
      );
      expect(result).toEqual(testData);
    } finally {
      await rm(imageBaseDir, { recursive: true });
    }
  });

  it("rejects absolute paths when imageBaseDir is not set", async () => {
    const fixturesDir = path.join(import.meta.dirname, "fixtures");

    await expect(
      defaultResolveImage(
        "/images/banner.png",
        path.join(fixturesDir, "some-post.md")
      )
    ).rejects.toThrow("Absolute image path requires imageBaseDir");
  });

  it("rejects path traversal attempts", async () => {
    const fixturesDir = path.join(import.meta.dirname, "fixtures");
    const imageBaseDir = path.join(fixturesDir, "_test_public");

    await expect(
      defaultResolveImage(
        "/../../etc/passwd",
        path.join(fixturesDir, "some-post.md"),
        imageBaseDir
      )
    ).rejects.toThrow("Image path escapes base directory");
  });

  it("resolves relative to the md file directory", async () => {
    const fixturesDir = path.join(import.meta.dirname, "fixtures");
    // Create a temporary image to test with
    const { writeFile, mkdir, rm } = await import("node:fs/promises");
    const imgDir = path.join(fixturesDir, "images");
    await mkdir(imgDir, { recursive: true });
    const imgPath = path.join(imgDir, "test.png");
    const testData = Buffer.from("fake-png-data");
    await writeFile(imgPath, testData);

    try {
      const result = await defaultResolveImage(
        "./images/test.png",
        path.join(fixturesDir, "sample-post.md")
      );
      expect(result).toEqual(testData);
    } finally {
      await rm(imgDir, { recursive: true });
    }
  });
});
