import express from "express";
import { getRekapSiswa, getDashboardBKData } from "../controllers/laporanAbsensiController.js";

const router = express.Router();

// Endpoint utama untuk Dashboard
router.get("/dashboard-bk", getDashboardBKData);

// Endpoint rekap individu
router.get("/rekap/:nis/:taId", getRekapSiswa);

export default router;