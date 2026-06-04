import { badRequest } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.flatten();
    return next(badRequest('Validation failed', errors));
  }

  const { body, query, params } = result.data;
  if (body) req.body = body;
  if (query) req.query = { ...req.query, ...query };
  if (params) req.params = { ...req.params, ...params };
  next();
};
