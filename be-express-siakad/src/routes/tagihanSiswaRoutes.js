import express from "express";
import * as TagihanController from "../controllers/tagihansiswaController.js";
import { verifyToken, authorizeRoles } from "../middleware/jwt.js";

const router = express.Router();

// Apply authentication middleware to all routes
// router.use(verifyToken); // Terapkan per route untuk fleksibilitas

/**
 * @route   GET /api/tagihan-siswa
 * @desc    Get all tagihan with filters
 * @access  Private
 */
router.get("/", verifyToken, TagihanController.getAllTagihan);

/**
 * @route   POST /api/tagihan-siswa/generate-spp
 * @desc    Generate SPP massal untuk semua siswa
 * @access  Private
 * @note    HARUS di atas /siswa/:nis agar tidak bentrok
 */
router.post("/generate-spp", verifyToken, TagihanController.generateSPPMassal);

/**
 * @route   GET /api/tagihan-siswa/siswa/:nis
 * @desc    Get tagihan by NIS with summary
 * @access  Private
 * @note    HARUS di atas /:id agar tidak bentrok
 */
router.get("/siswa/:nis", verifyToken, TagihanController.getTagihanByNIS);

/**
 * @route   GET /api/tagihan-siswa/:id
 * @desc    Get tagihan by TAGIHAN_ID
 * @access  Private
 * @note    HARUS paling bawah agar tidak catch semua route
 */
router.get("/:id", verifyToken, TagihanController.getTagihanById);

/**
 * @route   POST /api/tagihan-siswa
 * @desc    Create new tagihan
 * @access  Private
 */
router.post("/", verifyToken, TagihanController.createTagihan);

/**
 * @route   PUT /api/tagihan-siswa/:id
 * @desc    Update tagihan by TAGIHAN_ID
 * @access  Private
 */
router.put("/:id", verifyToken, TagihanController.updateTagihan);

/**
 * @route   DELETE /api/tagihan-siswa/:id
 * @desc    Delete tagihan by TAGIHAN_ID
 * @access  Private
 */
router.delete("/:id", verifyToken, TagihanController.deleteTagihan);

export default router;