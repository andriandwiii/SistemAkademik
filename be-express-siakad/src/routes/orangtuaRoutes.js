import { Router } from "express";
import * as OrtuController from "../controllers/orangtuaController.js"; // Ganti dengan alias yang lebih ringkas

const router = Router();

router.get("/:siswaId", OrtuController.getOrtuBySiswa);

router.post("/", OrtuController.addOrtu);

router.put("/:id", OrtuController.updateOrtu);

router.delete("/:id", OrtuController.deleteOrtu);

export default router;