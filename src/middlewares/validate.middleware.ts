import { Request, Response, NextFunction } from "express";
import { Schema } from "yup";

export const validateRequest =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof Error) {
        const yupError = error as any;
        const errors = yupError.inner?.reduce((acc: any, err: any) => {
          acc[err.path] = err.message;
          return acc;
        }, {}) || { message: yupError.message };

        return res.status(400).json({ errors });
      }
      return res.status(400).json({ message: "Invalid input" });
    }
  };
