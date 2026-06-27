import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { translationLimiter } from '../middleware/rateLimit';
import * as translation from '../controllers/translation.controller';

const router = Router();

router.use(authenticate);

router.post('/', translationLimiter, [
  body('sourceText').trim().isLength({ min: 1, max: 50000 }),
  body('targetLanguage').trim().isLength({ min: 2, max: 10 }),
  body('domain').optional().isIn(['general', 'legal', 'medical', 'technical', 'financial', 'government']),
  body('documentType').optional().isIn(['TEXT', 'DOCUMENT', 'IMAGE']),
], validate, translation.createTranslation);

router.post('/extract-file', translation.extractFile);
router.get('/', translation.listTranslations);
router.get('/audit', translation.getAuditLog);
router.get('/:id', translation.getTranslation);
router.post('/:id/rate', [
  body('rating').isInt({ min: 1, max: 5 }),
], validate, translation.rateTranslation);

export default router;
