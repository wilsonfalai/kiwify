import { parseAuthSessionHeader } from "@kiwifyclone/auth";
import { describe, expect, it } from "vitest";
import { createTestAuthHeaders } from "../src/index.js";

describe("auth test helpers", () => {
  it("creates headers that can be parsed by auth guards", () => {
    const headers = createTestAuthHeaders("producer");

    expect(parseAuthSessionHeader(headers["x-kiwifyclone-session"])).toMatchObject({
      user: {
        id: "producer-test-user",
        role: "producer"
      }
    });
  });
});
