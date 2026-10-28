import rateLimit from "express-rate-limit";

/**
 * Strict Rate Limiter for Authentication Endpoints.
 * Mitigates credential stuffing, brute-force dictionary attacks, and account enumeration.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    status: "fail",
    statusCode: 429,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

/**
 * General API Rate Limiter.
 * Mitigates resource exhaustion and basic Denial of Service (DoS) attempts.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: "fail",
    statusCode: 429,
    message: "Too many requests from this IP. Please slow down and try again shortly.",
  },
});
