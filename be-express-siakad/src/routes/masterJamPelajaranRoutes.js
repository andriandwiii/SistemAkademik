import express from 'express';
import {
  getAllJamPelajaran,
  getJamPelajaranById,
  createJamPelajaran,
  updateJamPelajaran,
  deleteJamPelajaran
} from '../controllers/masterJamPelajaranController.js';

const router = express.Router();

// Ambil semua data jam pelajaran
router.get('/', getAllJamPelajaran);

// Ambil jam pelajaran berdasarkan ID (huruf besar)
router.get('/:ID', getJamPelajaranById);

// Tambah jam pelajaran baru
router.post('/', createJamPelajaran);

// Update jam pelajaran berdasarkan ID
router.put('/:ID', updateJamPelajaran);

// Hapus jam pelajaran berdasarkan ID
router.delete('/:ID', deleteJamPelajaran);

export default router;
