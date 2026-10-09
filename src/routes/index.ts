import { Router } from "express";
import { createAstronautController } from "../controllers/astronautController";
import { createBodiesController } from "../controllers/bodiesController";
import { createQuizController } from "../controllers/quizController";
import { createToolsController } from "../controllers/toolsController";
import { validateBody } from "../middleware/validate";
import { quizAnswerBodySchema } from "../schemas/requests";
import { createBodiesService } from "../services/bodiesService";
import type { Content } from "../services/contentStore";
import { createQuizService } from "../services/quizService";
import { createToolsService } from "../services/toolsService";

export function createApiRouter(content: Content): Router {
  const bodies = createBodiesController(createBodiesService(content));
  const tools = createToolsController(createToolsService(content));
  const quiz = createQuizController(createQuizService(content));
  const astronaut = createAstronautController(content.script);

  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/astronaut/script", astronaut.script);

  router.get("/bodies", bodies.list);
  router.get("/bodies/:id", bodies.get);

  router.get("/tools/:toolId", tools.get);

  router.get("/quiz/:bodyId", quiz.get);
  router.post("/quiz/:bodyId/answer", validateBody(quizAnswerBodySchema), quiz.answer);

  return router;
}
