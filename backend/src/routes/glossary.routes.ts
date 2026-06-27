import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as glossary from '../controllers/glossary.controller';

const router = Router();
router.use(authenticate);

router.get('/', glossary.listTerms);
router.post('/', [
  body('sourceTerm').trim().isLength({ min: 1, max: 500 }),
  body('targetTerm').trim().isLength({ min: 1, max: 500 }),
  body('targetLang').trim().isLength({ min: 2, max: 10 }),
  body('sourceLang').optional().trim(),
  body('domain').optional().isIn(['general', 'legal', 'medical', 'technical', 'financial', 'government']),
  body('notes').optional().trim().isLength({ max: 1000 }),
], validate, glossary.createTerm);
router.delete('/:id', glossary.deleteTerm);

export default router;
