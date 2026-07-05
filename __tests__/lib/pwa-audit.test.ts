import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const publicDir = join(process.cwd(), "public");

function readJSON(file: string) {
  const content = readFileSync(join(publicDir, file), "utf-8");
  return JSON.parse(content);
}

function fileExists(file: string) {
  return existsSync(join(publicDir, file));
}

describe("PWA: manifest.webmanifest", () => {
  const manifest = readJSON("manifest.webmanifest");

  it("has required fields", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.id).toBeTruthy();
  });

  it("has theme_color and background_color", () => {
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  it("has at least 2 icon sizes", () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it("has 192x192 icon", () => {
    const icon = manifest.icons.find((i: { sizes: string }) => i.sizes === "192x192");
    expect(icon).toBeTruthy();
    expect(fileExists(icon.src.replace(/^\//, ""))).toBe(true);
  });

  it("has 512x512 icon", () => {
    const icon = manifest.icons.find((i: { sizes: string }) => i.sizes === "512x512");
    expect(icon).toBeTruthy();
    expect(fileExists(icon.src.replace(/^\//, ""))).toBe(true);
  });

  it("has maskable icon", () => {
    const icon = manifest.icons.find((i: { purpose: string }) => i.purpose === "maskable");
    expect(icon).toBeTruthy();
  });
});

describe("PWA: service worker", () => {
  it("sw.js exists in public/", () => {
    expect(fileExists("sw.js")).toBe(true);
  });

  it("sw.js is not empty", () => {
    const content = readFileSync(join(publicDir, "sw.js"), "utf-8");
    expect(content.length).toBeGreaterThan(100);
  });
});

describe("PWA: offline page", () => {
  it("offline page exists at src/app/offline/page.tsx", () => {
    expect(existsSync(join(process.cwd(), "src/app/offline/page.tsx"))).toBe(true);
  });
});

describe("PWA: layout metadata", () => {
  const layoutContent = readFileSync(
    join(process.cwd(), "src/app/layout.tsx"),
    "utf-8"
  );

  it("has manifest link", () => {
    expect(layoutContent).toContain('manifest: "/manifest.webmanifest"');
  });

  it("has appleWebApp capable", () => {
    expect(layoutContent).toContain("capable: true");
  });

  it("has themeColor in viewport", () => {
    expect(layoutContent).toContain("themeColor");
  });

  it("uses SerwistProvider", () => {
    expect(layoutContent).toContain("SerwistProvider");
    expect(layoutContent).toContain('swUrl="/sw.js"');
  });
});

describe("PWA: icons exist", () => {
  it("icon-192.png exists", () => {
    expect(fileExists("icons/icon-192.png")).toBe(true);
  });

  it("icon-512.png exists", () => {
    expect(fileExists("icons/icon-512.png")).toBe(true);
  });

  it("icon-maskable.png exists", () => {
    expect(fileExists("icons/icon-maskable.png")).toBe(true);
  });
});

describe("PWA: serwist config", () => {
  it("serwist.config.js exists", () => {
    expect(existsSync(join(process.cwd(), "serwist.config.js"))).toBe(true);
  });
});

describe("PWA: proxy excludes PWA assets", () => {
  const proxyContent = readFileSync(
    join(process.cwd(), "src/proxy.ts"),
    "utf-8"
  );

  it("proxy excludes manifest.webmanifest", () => {
    expect(proxyContent).toContain("manifest");
  });

  it("proxy excludes sw.js", () => {
    expect(proxyContent).toContain("sw");
  });

  it("proxy excludes offline page", () => {
    expect(proxyContent).toContain("offline");
  });

  it("proxy excludes icons", () => {
    expect(proxyContent).toContain("icons");
  });
});
