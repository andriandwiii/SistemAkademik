import * as WaktuPelajaranModel from "../models/masterWaktuPelajaranModel.js";

/**
 * Ambil semua data waktu pelajaran
 */
export const getAllWaktuPelajaran = async (req, res) => {
  try {
    const waktuPelajaran = await WaktuPelajaranModel.getAllWaktuPelajaran();
    res.status(200).json(waktuPelajaran);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil waktu pelajaran berdasarkan ID
 */
export const getWaktuPelajaranById = async (req, res) => {
  try {
    const waktuPelajaran = await WaktuPelajaranModel.getWaktuPelajaranById(req.params.id);
    if (!waktuPelajaran) {
      return res.status(404).json({ message: "Waktu Pelajaran tidak ditemukan" });
    }
    res.status(200).json(waktuPelajaran);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah waktu pelajaran baru
 */
export const createWaktuPelajaran = async (req, res) => {
  try {
    const { HARI, JAM_MULAI, JAM_SELESAI, DURASI, MATA_PELAJARAN, KELAS, RUANGAN, GURU_PENGAJAR, STATUS } = req.body;

    if (!HARI || !JAM_MULAI || !MATA_PELAJARAN || !KELAS || !RUANGAN || !GURU_PENGAJAR) {
      return res.status(400).json({ message: "HARI, JAM_MULAI, MATA_PELAJARAN, KELAS, RUANGAN, dan GURU_PENGAJAR wajib diisi" });
    }

    const newWaktuPelajaran = await WaktuPelajaranModel.createWaktuPelajaran({
      HARI,
      JAM_MULAI,
      JAM_SELESAI,
      DURASI,
      MATA_PELAJARAN,
      KELAS,
      RUANGAN,
      GURU_PENGAJAR,
      STATUS,
    });

    res.status(201).json(newWaktuPelajaran);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update waktu pelajaran berdasarkan ID
 */
export const updateWaktuPelajaran = async (req, res) => {
  try {
    const { HARI, JAM_MULAI, JAM_SELESAI, DURASI, MATA_PELAJARAN, KELAS, RUANGAN, GURU_PENGAJAR, STATUS } = req.body;

    const updatedWaktuPelajaran = await WaktuPelajaranModel.updateWaktuPelajaran(req.params.id, {
      HARI,
      JAM_MULAI,
      JAM_SELESAI,
      DURASI,
      MATA_PELAJARAN,
      KELAS,
      RUANGAN,
      GURU_PENGAJAR,
      STATUS,
    });

    if (!updatedWaktuPelajaran) {
      return res.status(404).json({ message: "Waktu Pelajaran tidak ditemukan" });
    }

    res.status(200).json(updatedWaktuPelajaran);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus waktu pelajaran berdasarkan ID
 */
export const deleteWaktuPelajaran = async (req, res) => {
  try {
    const deleted = await WaktuPelajaranModel.deleteWaktuPelajaran(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Waktu Pelajaran tidak ditemukan" });
    }

    res.status(200).json({ message: "Waktu Pelajaran berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
