import express from 'express';
import { getMonitoringAbsen, getHistorySiswa, getRekapAbsenSiswa, inputAbsenMasal, updateAbsensi, deleteAbsensi } from '../controllers/tuAbsensiController.js';
const router = express.Router();

router.get('/monitoring', getMonitoringAbsen);
router.post('/masal', inputAbsenMasal);
router.put('/monitoring/:id', updateAbsensi);
router.delete('/monitoring/:id', deleteAbsensi);
router.get('/riwayat/:nis', getHistorySiswa); // :nis bisa diisi email
router.get('/rekap/:nis', getRekapAbsenSiswa); 

export default router;