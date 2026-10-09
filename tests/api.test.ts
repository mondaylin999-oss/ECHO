import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { loadContent, type Content } from "../src/services/contentStore";
import type { Express } from "express";

const publicDir = path.resolve(__dirname, "..", "public");

let content: Content;
let app: Express;

beforeAll(() => {
  content = loadContent();
  // A generous limit so the suite itself is never throttled.
  app = createApp(content, { rateLimit: { windowMs: 60_000, max: 10_000 } });
});

const expectError = (body: unknown, code: string) => {
  expect(body).toEqual({ error: { code, message: expect.any(String) } });
};

describe("GET /api/health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/astronaut/script", () => {
  it("returns 8-10 short lines from Astro", async () => {
    const res = await request(app).get("/api/astronaut/script");
    expect(res.status).toBe(200);
    expect(res.body.speaker).toBe("Astro");
    expect(res.body.endPrompt).toBe("Tap to continue");
    expect(res.body.lines.length).toBeGreaterThanOrEqual(8);
    expect(res.body.lines.length).toBeLessThanOrEqual(10);
    for (const line of res.body.lines) {
      expect(Object.keys(line).sort()).toEqual(["id", "text"]);
      expect(line.text.length).toBeLessThanOrEqual(200);
    }
  });
});

describe("GET /api/bodies", () => {
  it("returns 11 bodies and only mars and moon have data", async () => {
    const res = await request(app).get("/api/bodies");
    expect(res.status).toBe(200);
    expect(res.body.bodies).toHaveLength(11);

    const ids = res.body.bodies.map((body: { id: string }) => body.id);
    expect(ids).toEqual([
      "sun",
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
      "moon",
    ]);

    const withData = res.body.bodies
      .filter((body: { hasData: boolean }) => body.hasData)
      .map((body: { id: string }) => body.id);
    expect(withData.sort()).toEqual(["mars", "moon"]);
  });

  it("matches the Body contract", async () => {
    const res = await request(app).get("/api/bodies");
    for (const body of res.body.bodies) {
      expect(Object.keys(body).sort()).toEqual(
        ["facts", "hasData", "id", "name", "parentId", "summary", "type", "visual"].sort(),
      );
      expect(Object.keys(body.facts).sort()).toEqual([
        "axialTiltDeg",
        "distanceFromParentMillionKm",
        "orbitalPeriodDays",
        "radiusKm",
        "rotationPeriodHours",
      ]);
      expect(body.visual.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }

    const byId = Object.fromEntries(res.body.bodies.map((b: { id: string }) => [b.id, b]));
    expect(byId.pluto.type).toBe("dwarf-planet");
    expect(byId.moon.type).toBe("moon");
    expect(byId.moon.parentId).toBe("earth");
    expect(byId.sun.type).toBe("star");
    expect(byId.sun.parentId).toBeNull();
  });
});

describe("GET /api/bodies/:id", () => {
  it.each(["mars", "moon"])("returns %s with at least 4 tool summaries", async (id) => {
    const res = await request(app).get(`/api/bodies/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.tools.length).toBeGreaterThanOrEqual(4);
    for (const tool of res.body.tools) {
      expect(Object.keys(tool).sort()).toEqual(["bodyId", "id", "location", "modelType", "name"]);
      expect(tool.bodyId).toBe(id);
    }
  });

  it("returns an empty tools array for a body without data", async () => {
    const res = await request(app).get("/api/bodies/jupiter");
    expect(res.status).toBe(200);
    expect(res.body.hasData).toBe(false);
    expect(res.body.tools).toEqual([]);
  });

  it("returns 404 for an unknown body", async () => {
    const res = await request(app).get("/api/bodies/vulcan");
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });
});

describe("GET /api/tools/:toolId", () => {
  it("returns a full tool", async () => {
    const res = await request(app).get("/api/tools/curiosity");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(
      [
        "agency",
        "bodyId",
        "facts",
        "id",
        "images",
        "location",
        "modelType",
        "name",
        "summary",
        "year",
      ].sort(),
    );
    expect(res.body.bodyId).toBe("mars");
    expect(res.body.facts.length).toBeGreaterThanOrEqual(3);
    expect(res.body.facts.length).toBeLessThanOrEqual(5);
  });

  it("returns 404 for an unknown tool", async () => {
    const res = await request(app).get("/api/tools/sojourner-2");
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });

  it("every tool has top/left/right images whose files exist and are served", async () => {
    expect(content.tools.length).toBeGreaterThanOrEqual(8);

    for (const { id } of content.tools) {
      const res = await request(app).get(`/api/tools/${id}`);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body.images).sort()).toEqual(["left", "right", "top"]);

      for (const view of ["top", "left", "right"] as const) {
        const image = res.body.images[view];
        expect(Object.keys(image).sort()).toEqual(["alt", "caption", "credit", "url"]);
        expect(image.url).toMatch(/^\/images\/tools\//);
        expect(fs.existsSync(path.join(publicDir, image.url)), `${image.url} is missing`).toBe(true);

        const served = await request(app).get(image.url);
        expect(served.status).toBe(200);
      }
    }
  });
});

describe("GET /api/quiz/:bodyId", () => {
  it.each(["mars", "moon"])("returns 5 questions for %s without leaking answers", async (bodyId) => {
    const res = await request(app).get(`/api/quiz/${bodyId}`);
    expect(res.status).toBe(200);
    expect(res.body.bodyId).toBe(bodyId);
    expect(res.body.questions).toHaveLength(5);

    const allowed = ["id", "prompt", "options", "difficulty", "relatedToolId"];
    for (const question of res.body.questions) {
      for (const key of Object.keys(question)) expect(allowed).toContain(key);
      expect(question.options).toHaveLength(4);
      for (const option of question.options) {
        expect(Object.keys(option).sort()).toEqual(["id", "text"]);
      }
    }

    const raw = res.text;
    expect(raw).not.toMatch(/correct/i);
    expect(raw).not.toMatch(/explanation/i);
    expect(raw).not.toMatch(/answer/i);
    for (const question of content.quizzes[bodyId as "mars" | "moon"]) {
      expect(raw).not.toContain(question.explanation);
    }
  });

  it("uses a mix of difficulties and ties several questions to tools", async () => {
    for (const bodyId of ["mars", "moon"]) {
      const res = await request(app).get(`/api/quiz/${bodyId}`);
      const questions: { difficulty: string; relatedToolId?: string }[] = res.body.questions;
      expect(new Set(questions.map((q) => q.difficulty)).size).toBeGreaterThanOrEqual(2);
      expect(questions.filter((q) => q.relatedToolId).length).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(["earth", "jupiter", "nowhere"])("returns 404 for %s", async (bodyId) => {
    const res = await request(app).get(`/api/quiz/${bodyId}`);
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });
});

describe("POST /api/quiz/:bodyId/answer", () => {
  it("confirms a correct answer", async () => {
    const question = content.quizzes.mars[0]!;
    const res = await request(app)
      .post("/api/quiz/mars/answer")
      .send({ questionId: question.id, optionId: question.correctOptionId });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: true,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
    });
  });

  it("flags an incorrect answer and still reveals the right one", async () => {
    const question = content.quizzes.moon[0]!;
    const wrong = question.options.find((option) => option.id !== question.correctOptionId)!;
    const res = await request(app)
      .post("/api/quiz/moon/answer")
      .send({ questionId: question.id, optionId: wrong.id });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: false,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
    });
  });

  it.each([
    ["an empty body", {}],
    ["a missing optionId", { questionId: "mars-q1" }],
    ["a non-string questionId", { questionId: 7, optionId: "a" }],
    ["an empty optionId", { questionId: "mars-q1", optionId: "" }],
    ["an option that does not belong to the question", { questionId: "mars-q1", optionId: "z" }],
  ])("returns 400 for %s", async (_label, payload) => {
    const res = await request(app).post("/api/quiz/mars/answer").send(payload);
    expect(res.status).toBe(400);
    expectError(res.body, "VALIDATION_ERROR");
    expect(JSON.stringify(res.body)).not.toMatch(/correctOptionId/);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/quiz/mars/answer")
      .set("Content-Type", "application/json")
      .send('{"questionId": ');
    expect(res.status).toBe(400);
    expectError(res.body, "INVALID_JSON");
  });

  it("returns 404 for an unknown question", async () => {
    const res = await request(app)
      .post("/api/quiz/mars/answer")
      .send({ questionId: "mars-q999", optionId: "a" });
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });

  it("returns 404 for a question that belongs to another body", async () => {
    const res = await request(app)
      .post("/api/quiz/mars/answer")
      .send({ questionId: "moon-q1", optionId: "a" });
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });

  it("returns 404 for a body without a quiz", async () => {
    const res = await request(app)
      .post("/api/quiz/venus/answer")
      .send({ questionId: "mars-q1", optionId: "a" });
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });
});

describe("cross-cutting behaviour", () => {
  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });

  it("returns a JSON 404 for a missing image", async () => {
    const res = await request(app).get("/images/tools/does-not-exist.svg");
    expect(res.status).toBe(404);
    expectError(res.body, "NOT_FOUND");
  });

  it("only allows the configured CORS origin", async () => {
    const limited = createApp(content, { corsOrigins: ["http://localhost:5173"] });

    const allowed = await request(limited).get("/api/health").set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    const blocked = await request(limited).get("/api/health").set("Origin", "http://evil.example");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("sets helmet security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("rate limits with the standard error shape", async () => {
    const limited = createApp(content, { rateLimit: { windowMs: 60_000, max: 2 } });
    expect((await request(limited).get("/api/health")).status).toBe(200);
    expect((await request(limited).get("/api/health")).status).toBe(200);

    const res = await request(limited).get("/api/health");
    expect(res.status).toBe(429);
    expectError(res.body, "RATE_LIMITED");
  });
});
