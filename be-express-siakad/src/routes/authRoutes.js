import { Router } from "express";
import * as AuthController from "../controllers/authController.js"; // pastikan path benar
import { verifyToken } from "../middleware/jwt.js"; // middleware JWT untuk proteksi route
import upload from "../middleware/upload-foto.js"; // middleware untuk upload foto

const router = Router();

// LOGIN
router.post("/login", AuthController.login);

// REGISTER (hanya SUPER_ADMIN bisa menambahkan user, proteksi bisa di middleware)
router.post("/register", AuthController.register);

router.post("/register-siswa", upload.single("foto"), AuthController.registerSiswa);
router.post("/register-guru", upload.single("foto"), AuthController.registerGuru);

// LOGOUT
router.post("/logout", verifyToken, AuthController.logout);

export default router;
