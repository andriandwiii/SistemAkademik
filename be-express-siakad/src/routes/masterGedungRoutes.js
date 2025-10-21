import express from 'express';
import {
  getAllGedung,
  getGedungById,
  createGedung,
  updateGedung,
  deleteGedung
} from '../controllers/masterGedungController.js';

const router = express.Router();

// Endpoint untuk master_gedung
router.get('/', getAllGedung);
router.get('/:id', getGedungById);
router.post('/', createGedung);
router.put('/:id', updateGedung);
router.delete('/:id', deleteGedung);

export default router;
