import { z } from "zod";

const idSchema = z.string().trim().min(1).max(64);

export const quizAnswerBodySchema = z.object({
  questionId: idSchema,
  optionId: idSchema,
});

export type QuizAnswerBody = z.infer<typeof quizAnswerBodySchema>;
