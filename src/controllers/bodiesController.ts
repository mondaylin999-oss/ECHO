import type { Request, Response } from "express";
import type { BodiesService } from "../services/bodiesService";

export function createBodiesController(service: BodiesService) {
  return {
    list(_req: Request, res: Response) {
      res.json({ bodies: service.list() });
    },

    get(req: Request<{ id: string }>, res: Response) {
      res.json(service.getWithTools(req.params.id));
    },
  };
}
