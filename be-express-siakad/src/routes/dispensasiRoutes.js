import express from "express";
import * as dispensasiController
  from "../controllers/dispensasiController.js";

const router = express.Router();

/**
 * GET
 * /api/dispensasi
 * ?nis=
 * &status=
 * &jenis=
 */
router.get("/", dispensasiController.getAllDispensasi);

/**
 * GET
 * /api/dispensasi/:id
 */
router.get("/:id", dispensasiController.getDispensasiById);

/**
 * POST
 * /api/dispensasi
 */
router.post("/", dispensasiController.createDispensasi);

/**
 * PUT
 * /api/dispensasi/:id
 * (hanya jika status = DIAJUKAN)
 */
router.put("/:id", dispensasiController.updateDispensasi);

/**
 * PUT
 * /api/dispensasi/:id/approve
 */
router.put("/:id/approve", dispensasiController.approveDispensasi);

/**
 * PUT
 * /api/dispensasi/:id/reject
 */
router.put("/:id/reject", dispensasiController.rejectDispensasi);

/**
 * DELETE
 * /api/dispensasi/:id
 */
router.delete("/:id", dispensasiController.deleteDispensasi);

export default router;
