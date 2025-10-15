// D:\stylescapes\backend\src\middleware\securityMiddleware.js

const cors = require('cors'); // To be installed: npm install cors
const rateLimit = require('express-rate-limit'); // To be installed: npm install express-rate-limit

// Middleware to prevent Cross-Site Scripting (XSS) attacks.
exports.xssSanitizer = (req, res, next) => {
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);

    next();
};

// Middleware to manage Cross-Origin Resource Sharing (CORS) policies.
exports.corsProtection = cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// A function that returns a different rate limiter for mobile and desktop clients.
const createRateLimiter = (minutes, maxRequests) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: maxRequests,
        message: "Too many attempts, please try again after 15 minutes",
    });
};

// We will use two different rate limiters based on the client type.
// This is a more advanced approach for better security.
const mobileLimiter = createRateLimiter(20, 50); // 20 minutes for mobile
const desktopLimiter = createRateLimiter(15, 100); // 15 minutes for desktop

exports.rateLimiter = (req, res, next) => {
    const isMobile = req.headers['user-agent'] && req.headers['user-agent'].includes('Mobile');

    if (isMobile) {
        return mobileLimiter(req, res, next);
    } else {
        return desktopLimiter(req, res, next);
    }
};