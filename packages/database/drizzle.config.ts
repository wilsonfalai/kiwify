import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: "../../.env" });
loadEnv({ path: "../../.env.local", override: false });

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://kiwifyclone:kiwifyclone@localhost:5432/kiwifyclone"
  },
  strict: true,
  verbose: true
});
