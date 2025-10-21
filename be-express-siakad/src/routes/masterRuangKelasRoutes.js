import express from 'express';
import {
  getAllRuang,
  getRuangById,
  createRuang,
  updateRuang,
  deleteRuang
} from '../controllers/masterRuangKelasController.js';

const router = express.Router();

// Endpoint untuk master_ruang
router.get('/', getAllRuang);
router.get('/:id', getRuangById);
router.post('/', createRuang);
router.put('/:id', updateRuang);
router.delete('/:id', deleteRuang);

export default router;
