import express from 'express';
import {
  getAllJurusan,
  getJurusanById,
  createJurusan,
  updateJurusan,
  deleteJurusan
} from '../controllers/jurusanController.js';

const router = express.Router();

router.get('/', getAllJurusan);
router.get('/:id', getJurusanById);
router.post('/', createJurusan);
router.put('/:id', updateJurusan);
router.delete('/:id', deleteJurusan);

export default router;
