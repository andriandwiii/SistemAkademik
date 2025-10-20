import { Router } from "express";
import * as AuthController from "../controllers/authController.js"; // pastikan path benar
import { verifyToken } from "../middleware/jwt.js"; // middleware JWT untuk proteksi route

const router = Router();

// LOGIN
router.post("/login", AuthController.login);

// REGISTER (hanya SUPER_ADMIN bisa menambahkan user, proteksi bisa di middleware)
router.post("/register", AuthController.register);

router.post("/register-siswa", AuthController.registerSiswa);
router.post("/register-guru", AuthController.registerGuru);

// LOGOUT
router.post("/logout", verifyToken, AuthController.logout);

export default router;
