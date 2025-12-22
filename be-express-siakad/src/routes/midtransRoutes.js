import express from "express";
import { midtransNotification } from "../controllers/midtransController.js";

const router = express.Router();

router.post("/notification", midtransNotification);

export default router;
