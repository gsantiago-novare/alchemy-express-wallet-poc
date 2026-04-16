import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

const validate =
  (
    schema: z.ZodSchema, 
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "Validation failed.",
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      console.error("Validation logic error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

export default validate;
