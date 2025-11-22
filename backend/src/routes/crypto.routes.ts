import express from 'express';
import auth from '../middlewares/auth.js';
import { getCryptoPrices } from '../controllers/crypto.controller.js';

const router = express.Router();

router.get('/prices', auth, getCryptoPrices);

export default router;
