import express from "express";
import * as pembayaranController from "../controllers/pembayaranController.js";
import { verifyToken, authorizeRoles } from "../middleware/jwt.js";

const router = express.Router();

/**
 * @route   GET /api/pembayaran
 * @desc    Get all pembayaran with filters
 * @query   ?nis=&status=&metode_bayar=&start_date=&end_date=
 * @access  Private
 */
router.get("/", verifyToken, pembayaranController.getAllPembayaran);

/**
 * @route   POST /api/pembayaran/tunai
 * @desc    Create pembayaran tunai (di loket sekolah)
 * @access  Private
 */
router.post("/tunai", verifyToken, pembayaranController.createPembayaranTunai);

/**
 * @route   POST /api/pembayaran/online
 * @desc    Create pembayaran online via Midtrans
 * @access  Private
 */
router.post("/online", verifyToken, pembayaranController.createPembayaranOnline);

/**
 * 🔥 NEW: Get pembayaran by Midtrans Order ID
 * @route   GET /api/pembayaran/midtrans/:order_id
 * @desc    Get pembayaran by Midtrans Order ID (untuk payment finish page)
 * @access  Public (untuk redirect dari Midtrans)
 * @note    Must be BEFORE /midtrans/notification to avoid route conflict
 */
router.get(
  "/midtrans/:order_id",
  pembayaranController.getPembayaranByMidtransOrderId
);

/**
 * @route   POST /api/pembayaran/midtrans/notification
 * @desc    Handle Midtrans notification callback (webhook)
 * @access  Public (Midtrans callback)
 * @note    This route should NOT have verifyToken middleware
 */
router.post(
  "/midtrans/notification",
  pembayaranController.handleMidtransNotification
);

/**
 * @route   GET /api/pembayaran/midtrans/status/:order_id
 * @desc    Check payment status from Midtrans
 * @access  Private
 */
router.get(
  "/midtrans/status/:order_id",
  verifyToken,
  pembayaranController.checkPaymentStatus
);

/**
 * @route   GET /api/pembayaran/:id
 * @desc    Get pembayaran by PEMBAYARAN_ID with details
 * @access  Private
 */
router.get("/:id", verifyToken, pembayaranController.getPembayaranById);

/**
 * @route   DELETE /api/pembayaran/:id
 * @desc    Delete pembayaran by PEMBAYARAN_ID (only PENDING/GAGAL)
 * @access  Private
 */
router.delete("/:id", verifyToken, pembayaranController.deletePembayaran);

export default router;