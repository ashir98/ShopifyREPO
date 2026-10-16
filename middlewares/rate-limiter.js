import rateLimit from "express-rate-limit";

export const loginLimiter =  rateLimit({
    windowMs: 15000,
    max: 5,
    standardHeaders: true,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes"
    }
})