import type { Request, Response } from "express";
import type { AstronautScript } from "../schemas/content";

export function createAstronautController(script: AstronautScript) {
  return {
    script(_req: Request, res: Response) {
      res.json(script);
    },
  };
}
