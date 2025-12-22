import express from "express";
import * as masterTarifBiayaController
  from "../controllers/tarifbiayaController.js";

const router = express.Router();

/**
 * GET
 * /api/master-tarif-biaya
 * ?tahun_ajaran_id=
 * &kategori_id=
 * &tingkatan_id=
 * &komponen_id=
 */
router.get("/", masterTarifBiayaController.getAllTarif);

/**
 * GET
 * /api/master-tarif-biaya/:id
 */
router.get("/:id", masterTarifBiayaController.getTarifById);

/**
 * POST
 * /api/master-tarif-biaya
 */
router.post("/", masterTarifBiayaController.createTarif);

/**
 * PUT
 * /api/master-tarif-biaya/:id
 */
router.put("/:id", masterTarifBiayaController.updateTarif);

/**
 * DELETE (soft delete)
 * /api/master-tarif-biaya/:id
 */
router.delete("/:id", masterTarifBiayaController.deleteTarif);

/**
 * DELETE (hard delete)
 * /api/master-tarif-biaya/hard/:id
 */
router.delete("/hard/:id", masterTarifBiayaController.hardDeleteTarif);

export default router;
