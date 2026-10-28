/**
 * High-Precision Structured HTTP Request Timing & Logger Middleware.
 */
export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = (Number(end - start) / 1e6).toFixed(2);
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const status = res.statusCode;

    // Visual color indicator for terminal
    const statusColor = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
    const resetColor = "\x1b[0m";

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl || req.url} ${statusColor}${status}${resetColor} - ${durationMs}ms - IP: ${ip}`
    );
  });

  next();
};

export default requestLogger;
