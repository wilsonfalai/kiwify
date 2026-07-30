import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const read = (path: string) => readFileSync(join(root, path), "utf8");

const requiredApps = ["members", "products", "admin", "checkout", "api", "worker"];
const requiredPackages = ["config", "database", "auth", "schemas", "ui", "test-utils"];
const requiredEnv = [
  "DATABASE_URL",
  "REDIS_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "ASAAS_API_KEY",
  "ASAAS_BASE_URL",
  "ASAAS_ENVIRONMENT",
  "ASAAS_WEBHOOK_TOKEN",
  "NEXT_PUBLIC_API_URL"
];
const requiredDocs = [
  "product-vision.md",
  "architecture.md",
  "database-model.md",
  "payment-asaas-flow.md",
  "deploy-vercel-dokploy.md",
  "git-flow.md",
  "testing-strategy.md"
];
const frontendApps = ["products", "checkout", "members", "admin"];

describe("phase 1 monorepo foundation", () => {
  it("declares pnpm workspaces for apps and packages", () => {
    const workspace = read("pnpm-workspace.yaml");

    expect(workspace).toContain('"apps/*"');
    expect(workspace).toContain('"packages/*"');
  });

  it("contains all required app workspaces", () => {
    for (const app of requiredApps) {
      expect(existsSync(join(root, "apps", app, "package.json"))).toBe(true);
      expect(existsSync(join(root, "apps", app, "src", "index.ts"))).toBe(true);
    }
  });

  it("contains all required package workspaces", () => {
    for (const packageName of requiredPackages) {
      expect(existsSync(join(root, "packages", packageName, "package.json"))).toBe(true);
      expect(existsSync(join(root, "packages", packageName, "src", "index.ts"))).toBe(true);
    }
  });

  it("defines required root scripts", () => {
    const manifest = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    const scripts = Object.keys(manifest.scripts);

    expect(scripts).toEqual(
      expect.arrayContaining([
        "dev",
        "build",
        "lint",
        "typecheck",
        "test",
        "test:unit",
        "test:integration",
        "test:e2e",
        "ci"
      ])
    );
  });

  it("documents required environment variables without real secrets", () => {
    const env = read(".env.example");

    for (const key of requiredEnv) {
      expect(env).toContain(`${key}=`);
    }

    expect(env).not.toMatch(/sk_live|secret_live|password123/i);
  });

  it("documents required MVP topics", () => {
    for (const doc of requiredDocs) {
      const content = read(join("docs", doc));

      expect(content.trim().length).toBeGreaterThan(40);
    }
  });

  it("defines GitHub Actions CI checks", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).toContain("pnpm install");
    expect(workflow).toContain("pnpm lint");
    expect(workflow).toContain("pnpm typecheck");
    expect(workflow).toContain("pnpm test");
    expect(workflow).toContain("pnpm test:integration");
    expect(workflow).toContain("pnpm test:e2e");
  });

  it("defines local PostgreSQL and Redis services", () => {
    const compose = read("docker-compose.yml");

    expect(compose).toContain("postgres:");
    expect(compose).toContain("redis:");
    expect(compose).toContain("healthcheck:");
  });

  it("defines Vercel config for every frontend without sensitive env values", () => {
    for (const app of frontendApps) {
      const config = JSON.parse(read(join("apps", app, "vercel.json"))) as {
        buildCommand?: string;
        installCommand?: string;
        outputDirectory?: string;
        env?: Record<string, string>;
      };

      expect(config.buildCommand).toBe(`pnpm --filter @kiwifyclone/${app} build`);
      expect(config.installCommand).toBe("pnpm install --frozen-lockfile");
      expect(config.outputDirectory).toBe("dist");
      expect(JSON.stringify(config.env ?? {})).not.toMatch(/SECRET|TOKEN|ASAAS_API_KEY|DATABASE_URL|REDIS_URL/);
    }
  });

  it("defines Dockerfiles for API and worker deploys", () => {
    const apiDockerfile = read("apps/api/Dockerfile");
    const workerDockerfile = read("apps/worker/Dockerfile");

    expect(apiDockerfile).toContain("pnpm --filter @kiwifyclone/api build");
    expect(apiDockerfile).toContain("EXPOSE 3001");
    expect(apiDockerfile).toContain('CMD ["node", "dist/index.js"]');
    expect(workerDockerfile).toContain("pnpm --filter @kiwifyclone/worker build");
    expect(workerDockerfile).not.toContain("EXPOSE");
    expect(workerDockerfile).toContain('CMD ["node", "dist/index.js"]');
  });

  it("documents Vercel and Dokploy deploy boundaries", () => {
    const deployDoc = read("docs/deploy-vercel-dokploy.md");

    expect(deployDoc).toContain("apps/products");
    expect(deployDoc).toContain("apps/checkout");
    expect(deployDoc).toContain("apps/members");
    expect(deployDoc).toContain("apps/admin");
    expect(deployDoc).toContain("apps/api");
    expect(deployDoc).toContain("apps/worker");
    expect(deployDoc).toContain("staging");
    expect(deployDoc).toContain("production");
    expect(deployDoc).toContain("DATABASE_URL");
    expect(deployDoc).toContain("REDIS_URL");
  });
});
