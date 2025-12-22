import express from "express";
import * as masterKategoriSiswaController 
  from "../controllers/masterKategoriSiswaController.js";

const router = express.Router();

router.get("/", masterKategoriSiswaController.getAllKategori);
router.get("/:id", masterKategoriSiswaController.getKategoriById);
router.post("/", masterKategoriSiswaController.createKategori);
router.put("/:id", masterKategoriSiswaController.updateKategori);
router.delete("/:id", masterKategoriSiswaController.deleteKategori);
router.delete("/hard/:id", masterKategoriSiswaController.hardDeleteKategori);

export default router;
