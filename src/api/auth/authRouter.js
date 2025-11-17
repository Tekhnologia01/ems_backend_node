import express from 'express';
import { authController } from './authController.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, registerSchema, refreshTokenSchema, logoutSchema } from './authSchema.js';

export const authRouter = (() => {
    const router = express.Router();

    // Login user
    router.post('/login', validate(loginSchema), authController.login);

    // Register user
    router.post('/register', validate(registerSchema), authController.register);

    // Refresh token
    router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

    // Logout user
    router.post('/logout', validate(logoutSchema), authController.logout);
    
    return router;
})();

