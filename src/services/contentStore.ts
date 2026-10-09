import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { config } from "../config";
import { ContentError } from "../errors";
import {
  DATA_BODY_IDS,
  astronautScriptSchema,
  bodiesFileSchema,
  quizFileSchema,
  toolsFileSchema,
  type AstronautScript,
  type Body,
  type DataBodyId,
  type QuizQuestion,
  type Tool,
} from "../schemas/content";

export interface Content {
  bodies: Body[];
  tools: Tool[];
  quizzes: Record<DataBodyId, QuizQuestion[]>;
  script: AstronautScript;
}

function readJson<S extends z.ZodType>(dataDir: string, file: string, schema: S): z.infer<S> {
  const label = `data/${file}`;
  let raw: string;
  try {
    raw = fs.readFileSync(path.join(dataDir, file), "utf8");
  } catch (err) {
    throw new ContentError(`${label}: cannot read file (${(err as Error).message})`);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new ContentError(`${label}: invalid JSON (${(err as Error).message})`);
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new ContentError(`${label}: does not match the expected shape\n${details}`);
  }
  return result.data;
}

function findDuplicate(ids: string[]): string | undefined {
  return ids.find((id, index) => ids.indexOf(id) !== index);
}

/** Loads every file under data/ and checks the references between them. Throws ContentError on any problem. */
export function loadContent(dataDir: string = config.dataDir): Content {
  const { bodies } = readJson(dataDir, "bodies.json", bodiesFileSchema);
  const { tools } = readJson(dataDir, "tools.json", toolsFileSchema);
  const { quizzes: quizList } = readJson(dataDir, "quiz.json", quizFileSchema);
  const script = readJson(dataDir, "astronaut-script.json", astronautScriptSchema);

  const problems: string[] = [];
  const bodyIds = new Set(bodies.map((body) => body.id));
  const toolIds = new Set(tools.map((tool) => tool.id));

  const duplicateBody = findDuplicate(bodies.map((body) => body.id));
  if (duplicateBody) problems.push(`data/bodies.json: duplicate body id "${duplicateBody}"`);

  for (const body of bodies) {
    if (body.parentId !== null && !bodyIds.has(body.parentId)) {
      problems.push(`data/bodies.json: "${body.id}" has unknown parentId "${body.parentId}"`);
    }
    const expected = (DATA_BODY_IDS as readonly string[]).includes(body.id);
    if (body.hasData !== expected) {
      problems.push(`data/bodies.json: "${body.id}" must have hasData ${expected}`);
    }
  }
  for (const id of DATA_BODY_IDS) {
    if (!bodyIds.has(id)) problems.push(`data/bodies.json: missing required body "${id}"`);
  }

  const duplicateTool = findDuplicate(tools.map((tool) => tool.id));
  if (duplicateTool) problems.push(`data/tools.json: duplicate tool id "${duplicateTool}"`);

  const duplicateQuiz = findDuplicate(quizList.map((quiz) => quiz.bodyId));
  if (duplicateQuiz) problems.push(`data/quiz.json: more than one quiz for "${duplicateQuiz}"`);

  const allQuestions = quizList.flatMap((quiz) => quiz.questions);
  const duplicateQuestion = findDuplicate(allQuestions.map((question) => question.id));
  if (duplicateQuestion) {
    problems.push(`data/quiz.json: duplicate question id "${duplicateQuestion}"`);
  }

  for (const question of allQuestions) {
    const optionIds = question.options.map((option) => option.id);
    if (findDuplicate(optionIds)) {
      problems.push(`data/quiz.json: question "${question.id}" has duplicate option ids`);
    }
    if (!optionIds.includes(question.correctOptionId)) {
      problems.push(
        `data/quiz.json: question "${question.id}" has a correctOptionId that is not one of its options`,
      );
    }
    if (question.relatedToolId && !toolIds.has(question.relatedToolId)) {
      problems.push(
        `data/quiz.json: question "${question.id}" has unknown relatedToolId "${question.relatedToolId}"`,
      );
    }
  }

  const quizzes = {} as Record<DataBodyId, QuizQuestion[]>;
  for (const id of DATA_BODY_IDS) {
    const quiz = quizList.find((entry) => entry.bodyId === id);
    if (!quiz) problems.push(`data/quiz.json: missing quiz for "${id}"`);
    quizzes[id] = quiz?.questions ?? [];
  }

  if (findDuplicate(script.lines.map((line) => line.id))) {
    problems.push("data/astronaut-script.json: duplicate line ids");
  }

  if (problems.length > 0) {
    throw new ContentError(problems.join("\n"));
  }

  return { bodies, tools, quizzes, script };
}
