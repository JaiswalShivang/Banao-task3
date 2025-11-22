import express from 'express';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alert.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', auth, createAlert);
router.get('/me', auth, getAlerts);
router.delete('/:alertId', auth, deleteAlert);

export default router;
