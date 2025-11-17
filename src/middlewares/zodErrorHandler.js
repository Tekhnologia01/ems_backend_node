import { ZodError } from "zod";

export const zodErrorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({ 
        field: e.path.join(".") || "unknown",
        message: e.message
      })),
    });
  }

  next(err); // pass to next error handler if not ZodError
};
