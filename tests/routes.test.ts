import { describe, expect, it } from "vitest";
import { findRoute, staticRoutes } from "../src/core/routes.ts";
import { escapeHtml, renderShell, shellFilePath } from "../scripts/route-shells.ts";

describe("static routes", () => {
  it("have unique paths that start with / and have no trailing slash", () => {
    const paths = staticRoutes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path.startsWith("/")).toBe(true);
      if (path !== "/") expect(path.endsWith("/")).toBe(false);
    }
  });

  it("include the home page and a nested route", () => {
    expect(findRoute("/")).toBeDefined();
    expect(staticRoutes.some((r) => r.path.split("/").length > 2)).toBe(true);
  });

  it("are found with or without a trailing slash", () => {
    expect(findRoute("/about/build")?.title).toBe("Build information — ANATOMICA");
    expect(findRoute("/about/build/")?.title).toBe("Build information — ANATOMICA");
    expect(findRoute("/does-not-exist")).toBeUndefined();
  });
});

describe("route shells", () => {
  const template =
    '<html><head><title>Old</title>\n<meta name="description" content="Old description" /></head><body></body></html>';

  it("replace the title and description", () => {
    const html = renderShell(template, { title: "About — ANATOMICA", description: "New description" });
    expect(html).toContain("<title>About — ANATOMICA</title>");
    expect(html).toContain('<meta name="description" content="New description" />');
    expect(html).not.toContain("Old");
  });

  it("escape HTML special characters", () => {
    expect(escapeHtml('<b>"A" & B</b>')).toBe("&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;");
  });

  it("fail loudly if the template is missing a tag", () => {
    expect(() => renderShell("<html></html>", { title: "x", description: "y" })).toThrow();
  });

  it("map paths to files", () => {
    expect(shellFilePath("/")).toBe("index.html");
    expect(shellFilePath("/about")).toBe("about/index.html");
    expect(shellFilePath("/about/build")).toBe("about/build/index.html");
  });
});
