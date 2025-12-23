import express from "express";
import { getCekStatus } from "../controllers/statusPenilaianController.js";
// Tambahkan middleware auth jika diperlukan
// import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Endpoint: GET /api/penilaian/cek-status
router.get("/cek-status", getCekStatus);

export default router;