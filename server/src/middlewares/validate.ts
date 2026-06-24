import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Validation failed";
      res.status(400).json({ error: message });
      return;
    }

    req[source] = result.data;
    next();
  };
}
