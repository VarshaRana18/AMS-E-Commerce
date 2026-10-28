/**
 * Higher-order function wrapping asynchronous route handlers.
 * Guarantees that any rejected promise safely forwards to Express's next(err).
 * Eliminates repetitive try/catch boilerplate across controllers.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
