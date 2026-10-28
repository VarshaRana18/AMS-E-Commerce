import { AppError } from "../utils/appError.js";

/**
 * Higher-order middleware factory for Zod schema validation.
 * @param {import("zod").ZodSchema} schema - Zod validation schema
 * @param {"body" | "query" | "params"} source - Request property to validate (default: "body")
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return next(new AppError("Validation Failed", 422, formattedErrors));
    }

    // Replace req[source] with parsed/sanitized data from Zod
    req[source] = result.data;
    next();
  };
};

export default validate;
