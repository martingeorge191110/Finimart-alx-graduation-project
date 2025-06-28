import rateLimit from "express-rate-limit";

// Define rate limiter options
const rateLimiterOptions = {
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 200, // Limit each IP to 100 requests per windowMs
   message: {
      message: "Too many requests from this IP, please try again later.",
      status: "Failure",
   },
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// Create the rate limiter
const apiLimiter = rateLimit(rateLimiterOptions);

export default apiLimiter;
