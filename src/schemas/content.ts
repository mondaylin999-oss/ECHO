import { z } from "zod";

// Schemas for the JSON files under data/. Unknown keys (such as the "_todo" and
// "_comment" annotations) are stripped, so they never reach an API response.

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be a lowercase slug")
  .max(64);

export const DATA_BODY_IDS = ["mars", "moon"] as const;
export const dataBodyIdSchema = z.enum(DATA_BODY_IDS);

export const bodySchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  type: z.enum(["star", "planet", "dwarf-planet", "moon"]),
  parentId: slugSchema.nullable(),
  hasData: z.boolean(),
  summary: z.string().min(1),
  facts: z.object({
    radiusKm: z.number().positive(),
    distanceFromParentMillionKm: z.number().nonnegative(),
    orbitalPeriodDays: z.number().nonnegative(),
    rotationPeriodHours: z.number().positive(),
    axialTiltDeg: z.number().min(0).max(180),
  }),
  visual: z.object({
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "must be a #RRGGBB colour"),
    hasRings: z.boolean(),
  }),
});

export const bodiesFileSchema = z.object({ bodies: z.array(bodySchema) });

export const imageSchema = z.object({
  url: z.string().regex(/^\/images\/[\w./-]+$/, "must be a path under /images/"),
  alt: z.string().min(1),
  caption: z.string().min(1),
  credit: z.string().min(1),
});

export const toolSchema = z.object({
  id: slugSchema,
  bodyId: dataBodyIdSchema,
  name: z.string().min(1),
  modelType: z.enum(["rover", "helicopter", "lander", "lunar-rover", "instrument"]),
  year: z.number().int().min(1957).max(2100),
  agency: z.string().min(1),
  summary: z.string().min(1),
  facts: z.array(z.string().min(1)).min(3).max(5),
  location: z.object({
    site: z.string().min(1),
    latDeg: z.number().min(-90).max(90),
    lonDeg: z.number().min(-180).max(180),
  }),
  images: z.object({ top: imageSchema, left: imageSchema, right: imageSchema }),
  // Optional transparent cut-out the front-end pins to the globe at `location`.
  iconUrl: z
    .string()
    .regex(/^\/images\/[\w./-]+$/, "must be a path under /images/")
    .optional(),
  // Optional real 3D model (glb) the front-end shows rotating on the tool screen.
  modelUrl: z
    .string()
    .regex(/^\/models\/[\w.-]+\.glb$/, "must be a .glb path under /models/")
    .optional(),
});

export const toolsFileSchema = z.object({ tools: z.array(toolSchema) });

export const quizQuestionSchema = z.object({
  id: slugSchema,
  prompt: z.string().min(1),
  options: z.array(z.object({ id: slugSchema, text: z.string().min(1) })).length(4),
  difficulty: z.enum(["easy", "medium", "hard"]),
  relatedToolId: slugSchema.optional(),
  correctOptionId: slugSchema,
  explanation: z.string().min(1),
});

export const quizFileSchema = z.object({
  quizzes: z.array(
    z.object({
      bodyId: dataBodyIdSchema,
      questions: z.array(quizQuestionSchema).min(1),
    }),
  ),
});

export const astronautScriptSchema = z.object({
  speaker: z.string().min(1),
  lines: z
    .array(z.object({ id: slugSchema, text: z.string().min(1).max(200) }))
    .min(8)
    .max(10),
  endPrompt: z.string().min(1),
});

export type Body = z.infer<typeof bodySchema>;
export type Tool = z.infer<typeof toolSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type AstronautScript = z.infer<typeof astronautScriptSchema>;
export type DataBodyId = z.infer<typeof dataBodyIdSchema>;
