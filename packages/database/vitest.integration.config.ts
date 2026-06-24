import { defineConfig } from "vitest/config";
import baseConfig from "../config/vitest/base.js";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["test/**/*.integration.test.ts"]
  }
});
