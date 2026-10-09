import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "NOT_FOUND", `Route ${req.method} ${req.path} does not exist`));
}

// Errors raised by express.json() carry a `type` describing what went wrong.
function fromBodyParser(err: unknown): ApiError | undefined {
  const type = (err as { type?: unknown } | null)?.type;
  if (type === "entity.parse.failed") {
    return new ApiError(400, "INVALID_JSON", "Request body is not valid JSON");
  }
  if (type === "entity.too.large") {
    return new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const apiError = err instanceof ApiError ? err : fromBodyParser(err);
  if (apiError) {
    res.status(apiError.status).json({ error: { code: apiError.code, message: apiError.message } });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
}
