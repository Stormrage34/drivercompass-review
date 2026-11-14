import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock("@/lib/db", () => ({ db: { execute: mocks.execute } }));

import { GET } from "@/app/api/health/route";

describe("health route failure path", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
  });

  it("returns 200 without configuration data when the database answers", async () => {
    mocks.execute.mockResolvedValue([{ "?column?": 1 }]);
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: "ok", database: "up" });
    expect(Object.keys(body).sort()).toEqual(["checkedAt", "database", "status"]);
    expect(JSON.stringify(body)).not.toMatch(/postgres|password|DATABASE_URL/i);
  });

  it("returns 503 without a stack trace when the database is unavailable", async () => {
    mocks.execute.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:55432"));
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({ status: "unavailable", database: "down" });
    expect(Object.keys(body).sort()).toEqual(["checkedAt", "database", "status"]);
    expect(JSON.stringify(body)).not.toMatch(/ECONNREFUSED|postgres|password|stack/i);
  });
});
