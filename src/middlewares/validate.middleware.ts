import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

/**
 * Generic request-body validation middleware.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 *
 * On success: replaces req.body with the parsed (trimmed, lowercased,
 * defaulted) output so downstream code always sees clean data.
 *
 * On failure: returns a 400 with field-level error details. Does NOT
 * call next(err) because validation errors are not unexpected — we
 * format them ourselves for a consistent client experience.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
