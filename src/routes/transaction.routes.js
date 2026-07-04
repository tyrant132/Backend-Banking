import express from 'express';
import {authMiddleware,authSystemUserMiddleware} from '../middleware/auth.middleware.js';
import { createNewTransaction, createInitialFunds } from '../controllers/transaction.controller.js';

const router = express.Router();

router.post("/",authMiddleware,createNewTransaction)

router.post("/system/initial-funds",authSystemUserMiddleware,createInitialFunds)

export default router;