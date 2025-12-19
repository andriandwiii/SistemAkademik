import express from "express";
import { getDashboardTUData } from "../controllers/dashboardtuController.js";

const router = express.Router();

// Endpoint untuk mengambil semua data statistik dashboard TU
router.get("/stats", getDashboardTUData);

export default router;