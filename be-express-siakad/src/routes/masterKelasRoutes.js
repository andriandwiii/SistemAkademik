import { Router } from "express";
import {
  fetchAllKelas,
  getKelasByIdController,
  createNewKelas,
  updateKelasController,
  deleteKelasController,
} from "../controllers/kelasController.js";

const router = Router();

// GET all kelas
router.get("/", fetchAllKelas);

// GET kelas by ID
router.get("/:id", getKelasByIdController);

// POST new kelas
router.post("/", createNewKelas);

// PUT update kelas
router.put("/:id", updateKelasController);

// DELETE kelas
router.delete("/:id", deleteKelasController);

export default router;
