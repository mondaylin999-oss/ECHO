import type { Request, Response } from "express";
import type { QuizAnswerBody } from "../schemas/requests";
import type { QuizService } from "../services/quizService";

export function createQuizController(service: QuizService) {
  return {
    get(req: Request<{ bodyId: string }>, res: Response) {
      res.json(service.getQuiz(req.params.bodyId));
    },

    answer(req: Request<{ bodyId: string }, unknown, QuizAnswerBody>, res: Response) {
      const { questionId, optionId } = req.body;
      res.json(service.checkAnswer(req.params.bodyId, questionId, optionId));
    },
  };
}
