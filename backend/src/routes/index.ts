import { Router } from 'express';
import authRoutes from './auth.routes';
import translationRoutes from './translation.routes';
import glossaryRoutes from './glossary.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Linguara API' });
});

router.use('/auth', authRoutes);
router.use('/translations', translationRoutes);
router.use('/glossary', glossaryRoutes);

export default router;
