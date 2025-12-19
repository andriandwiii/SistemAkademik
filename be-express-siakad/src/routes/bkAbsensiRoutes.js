import express from "express";
import { 
    updateTindakanBK, 
    getDashboardBK 
} from "../controllers/bkAbsensiController.js";

const router = express.Router();

/**
 * DASHBOARD BK
 * Mengikuti pola Dashboard Guru: /api/bk-absensi/dashboard/:id
 */
router.get("/dashboard/:id", getDashboardBK);

/**
 * UPDATE TINDAKAN BK
 * Mengupdate catatan pembinaan berdasarkan ID Absensi
 */
router.put("/tindakan/:absensiId", updateTindakanBK);

export default router;