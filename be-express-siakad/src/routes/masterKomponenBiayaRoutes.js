import express from "express";
import * as masterKomponenBiayaController 
  from "../controllers/masterKomponenBiayaController.js";

const router = express.Router();

router.get("/", masterKomponenBiayaController.getAllKomponen);
router.get("/:id", masterKomponenBiayaController.getKomponenById);
router.post("/", masterKomponenBiayaController.createKomponen);
router.put("/:id", masterKomponenBiayaController.updateKomponen);
router.delete("/:id", masterKomponenBiayaController.deleteKomponen);
router.delete("/hard/:id", masterKomponenBiayaController.hardDeleteKomponen);

export default router;
