import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit AI requests to 10 per minute
    message: {
        error: 'AI request limit exceeded. Please wait before making another request.'
    }
});