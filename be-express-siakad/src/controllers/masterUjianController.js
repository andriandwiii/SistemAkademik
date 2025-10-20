import * as MasterUjianModel from "../models/masterUjianModel.js";

/**
 * Ambil semua data ujian
 */
export const getAllUjian = async (req, res) => {
  try {
    const ujian = await MasterUjianModel.getAllUjian();
    res.status(200).json(ujian);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil ujian berdasarkan ID
 */
export const getUjianById = async (req, res) => {
  try {
    const ujian = await MasterUjianModel.getUjianById(req.params.id);
    if (!ujian) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }
    res.status(200).json(ujian);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah ujian baru
 */
export const createUjian = async (req, res) => {
  try {
    const { NAMA_UJIAN, JENIS_UJIAN, TANGGAL_UJIAN, MAPEL_ID } = req.body;

    if (!NAMA_UJIAN || !JENIS_UJIAN || !TANGGAL_UJIAN || !MAPEL_ID) {
      return res.status(400).json({ message: "NAMA_UJIAN, JENIS_UJIAN, TANGGAL_UJIAN, dan MAPEL_ID wajib diisi" });
    }

    const newUjian = await MasterUjianModel.createUjian({
      NAMA_UJIAN,
      JENIS_UJIAN,
      TANGGAL_UJIAN,
      MAPEL_ID,
    });

    res.status(201).json(newUjian);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update ujian berdasarkan ID
 */
export const updateUjian = async (req, res) => {
  try {
    const { NAMA_UJIAN, JENIS_UJIAN, TANGGAL_UJIAN, MAPEL_ID } = req.body;

    const updatedUjian = await MasterUjianModel.updateUjian(req.params.id, {
      NAMA_UJIAN,
      JENIS_UJIAN,
      TANGGAL_UJIAN,
      MAPEL_ID,
    });

    if (!updatedUjian) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    res.status(200).json(updatedUjian);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus ujian berdasarkan ID
 */
export const deleteUjian = async (req, res) => {
  try {
    const deleted = await MasterUjianModel.deleteUjian(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    res.status(200).json({ message: "Ujian berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
