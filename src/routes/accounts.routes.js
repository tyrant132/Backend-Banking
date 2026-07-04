import express from "express";
import {authMiddleware} from "../middleware/auth.middleware.js";
import { createAccountController ,getUserAccountController,getAccountBalanceController} from "../controllers/account.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createAccountController)


router.get("/get",authMiddleware,getUserAccountController)

router.get("/balance/:accountId",authMiddleware,getAccountBalanceController)
export default router;