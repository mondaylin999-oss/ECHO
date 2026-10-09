import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { badRequest } from "../errors";

/** Replaces req.body with the parsed value, or forwards a 400 describing what is wrong. */
export function validateBody(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      next(badRequest(details));
      return;
    }
    req.body = result.data;
    next();
  };
}
