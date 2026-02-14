import { createTestApp } from "../_utils/createTestApp";
import { seedTestDb } from "../_utils/seed";
import type { INestApplication } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../src/db/db.module";

describe("Golden Tasks (GT-001/GT-002) — green path", () => {
  jest.setTimeout(30_000);

  const databaseUrl = process.env.DATABASE_URL;
  const projectId = (process.env.TEST_PROJECT_ID ?? "proj_test").trim();
  let app: INestApplication;
  let request: any;

  beforeAll(async () => {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL must be set to run Golden Task tests.");
    }
    if (!projectId) {
      throw new Error("TEST_PROJECT_ID must not be empty.");
    }

    // Must run before Nest boots (DB FK checks on insert).
    await seedTestDb({ databaseUrl, projectId });

    const testApp = await createTestApp();
    app = testApp.app;
    request = testApp.request;
  });

  it("GT-001: createDraft returns 201", async () => {
    const res = await request.post(`/projects/${projectId}/decisions/draft`).send({
      title: "GT-001 — Decision Draft",
      owner: "tester",
      assumptions: ["A1"],
      alternatives: ["Alt 1"],
      risks: ["R1"],
      successCriteria: ["S1"],
      nextSteps: ["N1"],
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^dec_/),
        projectId,
        status: "draft",
        title: "GT-001 — Decision Draft",
        owner: "tester",
      })
    );
    expect(Array.isArray(res.body.assumptions)).toBe(true);
    expect(res.body.assumptions.length).toBeGreaterThan(0);
  });

  it("GT-002: createDraft returns 201 (different payload)", async () => {
    const res = await request.post(`/projects/${projectId}/decisions/draft`).send({
      title: "GT-002 — Decision Draft",
      owner: "tester",
      ownerRole: "qa",
      assumptions: ["A1", "A2"],
      derivation: "Because we want deterministic tests.",
      alternatives: ["Alt 1"],
      risks: ["R1"],
      clientContext: "Seeded project should exist.",
      commsContext: "No live fetches.",
      clientImplications: "Should be safe.",
      goal: "Green tests",
      successCriteria: ["S1"],
      nextSteps: ["N1"],
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^dec_/),
        projectId,
        status: "draft",
        title: "GT-002 — Decision Draft",
        owner: "tester",
        ownerRole: "qa",
      })
    );
    expect(Array.isArray(res.body.alternatives)).toBe(true);
    expect(res.body.alternatives.length).toBeGreaterThan(0);
  });

  it("Monitoring smoke: GET /monitoring/drift returns 200", async () => {
    const res = await request.get("/monitoring/drift");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        range: expect.objectContaining({
          from: expect.any(String),
          to: expect.any(String),
        }),
        metrics: expect.any(Object),
      })
    );
  });

  afterAll(async () => {
    if (!app) return;
    try {
      const pool = app.get<Pool>(PG_POOL);
      await pool.end();
    } finally {
      await app.close();
    }
  });
});

