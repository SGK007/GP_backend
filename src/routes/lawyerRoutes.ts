import { Router } from 'express';
import { getAllLawyers, getLawyerById } from '../controllers/lawyer.controller';

const router = Router();

router.get('/', getAllLawyers);
router.get('/:id', getLawyerById);

export default router;