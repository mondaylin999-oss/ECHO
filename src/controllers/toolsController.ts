import type { Request, Response } from "express";
import type { ToolsService } from "../services/toolsService";

export function createToolsController(service: ToolsService) {
  return {
    get(req: Request<{ toolId: string }>, res: Response) {
      res.json(service.get(req.params.toolId));
    },
  };
}
