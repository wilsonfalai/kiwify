import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("phase 1 integration readiness", () => {
  it("has root files required by local setup", () => {
    const root = process.cwd();

    expect(existsSync(join(root, "package.json"))).toBe(true);
    expect(existsSync(join(root, "pnpm-workspace.yaml"))).toBe(true);
    expect(existsSync(join(root, "turbo.json"))).toBe(true);
    expect(existsSync(join(root, ".env.example"))).toBe(true);
    expect(existsSync(join(root, "docker-compose.yml"))).toBe(true);
  });
});
