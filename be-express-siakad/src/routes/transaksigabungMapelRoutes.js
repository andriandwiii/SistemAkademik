import express from "express";
import * as GabungController from "../controllers/transaksigabungMapelController.js";

const router = express.Router();

// Middleware authenticateToken telah dihapus dari semua endpoint
router.get("/", GabungController.getAll);
router.get("/:id", GabungController.getById);
router.post("/", GabungController.create);
router.put("/:id", GabungController.update);
router.delete("/:id", GabungController.remove);

export default router;