// routes/presensiRoutes.js
import { Router } from "express";
const PresensiController = require('../controllers/presensiController');

const router = Router();

router.get('/presensi', PresensiController.getAllPresensi);
router.post('/presensi', PresensiController.createPresensi);

export default router;
