export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (message: string) => new ApiError(404, "NOT_FOUND", message);

export const badRequest = (message: string) => new ApiError(400, "VALIDATION_ERROR", message);

/** Thrown at startup when a file under data/ is missing, unreadable or malformed. */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}
