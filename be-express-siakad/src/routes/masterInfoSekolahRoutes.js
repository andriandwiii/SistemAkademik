import express from 'express';
import {
  getAllInfoSekolah,
  getInfoSekolahById,
  createInfoSekolah,
  updateInfoSekolah,
  deleteInfoSekolah
} from '../controllers/masterinfosekolahController.js';

const router = express.Router();

router.get('/', getAllInfoSekolah);
router.get('/:id', getInfoSekolahById);
router.post('/', createInfoSekolah);
router.put('/:id', updateInfoSekolah);
router.delete('/:id', deleteInfoSekolah);

export default router;