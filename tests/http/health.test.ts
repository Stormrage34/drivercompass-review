import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { httpGet, startTestServer, stopTestServer } from "../helpers/http-server";
import { ensureTestDatabase } from "../helpers/test-db";

describe("health endpoint", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
  });

  it("reports a reachable database without exposing configuration", async () => {
    const response = await httpGet("/api/health");
    expect(response.status).toBe(200);
    const body = JSON.parse(response.body) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(body.database).toBe("up");
    expect(Object.keys(body).sort()).toEqual(["checkedAt", "database", "status"]);
  });
});
