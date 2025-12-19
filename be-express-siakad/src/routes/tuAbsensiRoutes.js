import express from 'express';
import { 
    getMonitoringAbsen, 
    inputAbsenMasal, 
    updateAbsensi, 
    deleteAbsensi, 
    getHistorySiswa // Harus ada di sini
} from '../controllers/tuAbsensiController.js';

const router = express.Router();

router.get('/monitoring', getMonitoringAbsen);
router.post('/masal', inputAbsenMasal);
router.put('/monitoring/:id', updateAbsensi);
router.delete('/monitoring/:id', deleteAbsensi);
router.get('/riwayat/:nis', getHistorySiswa);

export default router;