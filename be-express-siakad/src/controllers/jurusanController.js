import * as JurusanModel from "../models/jurusanModel.js";

/**
 * Ambil semua data jurusan
 */
export const getAllJurusan = async (req, res) => {
  try {
    const jurusan = await JurusanModel.getAllJurusan();
    res.status(200).json({ status: "success", data: jurusan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Ambil jurusan berdasarkan ID
 */
export const getJurusanById = async (req, res) => {
  try {
    const jurusan = await JurusanModel.getJurusanById(req.params.id);

    if (!jurusan) {
      return res.status(404).json({ status: "error", message: "Jurusan tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data: jurusan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Tambah jurusan baru
 */
export const createJurusan = async (req, res) => {
  try {
    const { NAMA_JURUSAN, DESKRIPSI } = req.body;

    if (!NAMA_JURUSAN) {
      return res.status(400).json({ status: "error", message: "NAMA_JURUSAN wajib diisi" });
    }

    const newJurusan = await JurusanModel.createJurusan({ NAMA_JURUSAN, DESKRIPSI });
    res.status(201).json({ status: "success", data: newJurusan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Update jurusan berdasarkan ID
 */
export const updateJurusan = async (req, res) => {
  try {
    const { NAMA_JURUSAN, DESKRIPSI } = req.body;

    const updatedJurusan = await JurusanModel.updateJurusan(req.params.id, { NAMA_JURUSAN, DESKRIPSI });

    if (!updatedJurusan) {
      return res.status(404).json({ status: "error", message: "Jurusan tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data: updatedJurusan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Hapus jurusan berdasarkan ID
 */
export const deleteJurusan = async (req, res) => {
  try {
    const deleted = await JurusanModel.deleteJurusan(req.params.id);

    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Jurusan tidak ditemukan" });
    }

    res.status(200).json({ status: "success", message: "Jurusan berhasil dihapus", data: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
