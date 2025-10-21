import express from 'express';
import {
  getAllTingkatan,
  getTingkatanById,
  createTingkatan,
  updateTingkatan,
  deleteTingkatan
} from '../controllers/masterTingkatanController.js';

const router = express.Router();

// Endpoint untuk master_tingkatan
router.get('/', getAllTingkatan);
router.get('/:id', getTingkatanById);
router.post('/', createTingkatan);
router.put('/:id', updateTingkatan);
router.delete('/:id', deleteTingkatan);

export default router;
