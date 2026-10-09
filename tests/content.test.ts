import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentError } from "../src/errors";
import { loadContent } from "../src/services/contentStore";

const realDataDir = path.resolve(__dirname, "..", "data");
const tempDirs: string[] = [];

/** Copies data/ to a temp folder and lets the test break one file in it. */
function dataDirWith(file: string, mutate: (json: any) => unknown | string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sse-data-"));
  tempDirs.push(dir);
  fs.cpSync(realDataDir, dir, { recursive: true });

  const target = path.join(dir, file);
  const result = mutate(JSON.parse(fs.readFileSync(target, "utf8")));
  fs.writeFileSync(target, typeof result === "string" ? result : JSON.stringify(result));
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("loadContent", () => {
  it("loads the real seed data", () => {
    const content = loadContent(realDataDir);
    expect(content.bodies).toHaveLength(11);
    expect(content.tools.filter((tool) => tool.bodyId === "mars").length).toBeGreaterThanOrEqual(4);
    expect(content.tools.filter((tool) => tool.bodyId === "moon").length).toBeGreaterThanOrEqual(4);
  });

  it("strips _todo annotations from the loaded data", () => {
    expect(JSON.stringify(loadContent(realDataDir))).not.toContain("_todo");
  });

  it("fails clearly on invalid JSON", () => {
    const dir = dataDirWith("bodies.json", () => "{ not json");
    expect(() => loadContent(dir)).toThrow(ContentError);
    expect(() => loadContent(dir)).toThrow(/data\/bodies\.json: invalid JSON/);
  });

  it("fails clearly on a wrong shape, naming the field", () => {
    const dir = dataDirWith("tools.json", (json) => {
      json.tools[0].location.latDeg = "north";
      return json;
    });
    expect(() => loadContent(dir)).toThrow(/data\/tools\.json[\s\S]*tools\.0\.location\.latDeg/);
  });

  it("fails when a file is missing", () => {
    const dir = dataDirWith("quiz.json", (json) => json);
    fs.rmSync(path.join(dir, "quiz.json"));
    expect(() => loadContent(dir)).toThrow(/data\/quiz\.json: cannot read file/);
  });

  it("rejects hasData on a body other than mars or moon", () => {
    const dir = dataDirWith("bodies.json", (json) => {
      json.bodies.find((body: any) => body.id === "venus").hasData = true;
      return json;
    });
    expect(() => loadContent(dir)).toThrow(/"venus" must have hasData false/);
  });

  it("rejects a correctOptionId that is not one of the options", () => {
    const dir = dataDirWith("quiz.json", (json) => {
      json.quizzes[0].questions[0].correctOptionId = "z";
      return json;
    });
    expect(() => loadContent(dir)).toThrow(/correctOptionId that is not one of its options/);
  });

  it("rejects a quiz question pointing at an unknown tool", () => {
    const dir = dataDirWith("quiz.json", (json) => {
      json.quizzes[0].questions[1].relatedToolId = "ghost-rover";
      return json;
    });
    expect(() => loadContent(dir)).toThrow(/unknown relatedToolId "ghost-rover"/);
  });

  it("rejects an astronaut line longer than 200 characters", () => {
    const dir = dataDirWith("astronaut-script.json", (json) => {
      json.lines[0].text = "x".repeat(201);
      return json;
    });
    expect(() => loadContent(dir)).toThrow(/data\/astronaut-script\.json/);
  });
});
