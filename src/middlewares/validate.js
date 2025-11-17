import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  
  let zodSchema = schema;
  if (schema.body || schema.params || schema.query || schema.headers) {
    zodSchema = z.object({
      params: schema.params || z.object({}).optional(),
      query: schema.query || z.object({}).optional(),
      body: schema.body || z.object({}).optional(),
      headers: schema.headers || z.object({}).optional(),
    });
  }

  if (!zodSchema || !zodSchema.parse) {
    return res.status(500).json({
      success: false,
      message: "Invalid schema provided to middleware",
    });
  }

  const data = {};
  if (zodSchema.shape.params) data.params = req.params || {};
  if (zodSchema.shape.query) data.query = req.query || {};
  if (zodSchema.shape.body) data.body = req.body || {};
  if (zodSchema.shape.headers) data.headers = req.headers || {};

  const result = zodSchema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.errors.map((err) => err.message),
    });
  }

  req.validated = result.data;
  next();
};
