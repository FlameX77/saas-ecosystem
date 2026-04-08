const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}

module.exports = { validate, validateQuery };
