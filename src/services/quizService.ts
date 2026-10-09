import { badRequest, notFound } from "../errors";
import { dataBodyIdSchema, type QuizQuestion } from "../schemas/content";
import type { Content } from "./contentStore";

export interface PublicQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  difficulty: QuizQuestion["difficulty"];
  relatedToolId?: string;
}

// Built field by field on purpose: anything not listed here (correctOptionId,
// explanation, future private fields) can never leak into GET /api/quiz/:bodyId.
const toPublicQuestion = (question: QuizQuestion): PublicQuestion => ({
  id: question.id,
  prompt: question.prompt,
  options: question.options.map((option) => ({ id: option.id, text: option.text })),
  difficulty: question.difficulty,
  ...(question.relatedToolId ? { relatedToolId: question.relatedToolId } : {}),
});

export function createQuizService(content: Content) {
  function questionsFor(bodyId: string): QuizQuestion[] {
    const parsed = dataBodyIdSchema.safeParse(bodyId);
    if (!parsed.success) throw notFound(`No quiz for body "${bodyId}"`);
    return content.quizzes[parsed.data];
  }

  return {
    getQuiz(bodyId: string): { bodyId: string; questions: PublicQuestion[] } {
      return { bodyId, questions: questionsFor(bodyId).map(toPublicQuestion) };
    },

    checkAnswer(bodyId: string, questionId: string, optionId: string) {
      const question = questionsFor(bodyId).find((candidate) => candidate.id === questionId);
      if (!question) {
        throw notFound(`No question with id "${questionId}" in the ${bodyId} quiz`);
      }
      if (!question.options.some((option) => option.id === optionId)) {
        throw badRequest(`optionId: "${optionId}" is not an option of question "${questionId}"`);
      }

      return {
        correct: optionId === question.correctOptionId,
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
      };
    },
  };
}

export type QuizService = ReturnType<typeof createQuizService>;
