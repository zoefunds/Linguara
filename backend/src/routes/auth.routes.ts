import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import * as auth from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name required'),
], validate, auth.register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, auth.login);

router.post('/refresh', auth.refreshToken);
router.post('/logout', authenticate, auth.logout);
router.get('/verify-email', auth.verifyEmail);
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, auth.forgotPassword);
router.post('/reset-password', authLimiter, [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, auth.resetPassword);
router.get('/me', authenticate, auth.getMe);
router.post('/export-key', authenticate, [
  body('password').notEmpty(),
], validate, auth.exportPrivateKey);

export default router;
