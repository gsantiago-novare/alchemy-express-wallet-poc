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
        const message = error.issues.map((issue) => issue.message).join(", ");
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: message,
        });
      }

      console.error("Validation logic error:", error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
      });
    }
  };

export default validate;
