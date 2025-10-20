import * as KurikulumModel from "../models/masterKurikulumModel.js";

/**
 * Ambil semua data kurikulum
 */
export const getAllKurikulum = async (req, res) => {
  try {
    const kurikulum = await KurikulumModel.getAllKurikulum();
    res.status(200).json(kurikulum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil kurikulum berdasarkan ID
 */
export const getKurikulumById = async (req, res) => {
  try {
    const kurikulum = await KurikulumModel.getKurikulumById(req.params.id);
    if (!kurikulum) {
      return res.status(404).json({ message: "Kurikulum tidak ditemukan" });
    }
    res.status(200).json(kurikulum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah kurikulum baru
 */
export const createKurikulum = async (req, res) => {
  try {
    const { NAMA_KURIKULUM, TAHUN, DESKRIPSI, STATUS } = req.body;

    if (!NAMA_KURIKULUM || !TAHUN) {
      return res.status(400).json({ message: "NAMA_KURIKULUM dan TAHUN wajib diisi" });
    }

    const newKurikulum = await KurikulumModel.createKurikulum({
      NAMA_KURIKULUM,
      TAHUN,
      DESKRIPSI,
      STATUS,
    });

    res.status(201).json(newKurikulum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update kurikulum berdasarkan ID
 */
export const updateKurikulum = async (req, res) => {
  try {
    const { NAMA_KURIKULUM, TAHUN, DESKRIPSI, STATUS } = req.body;

    const updatedKurikulum = await KurikulumModel.updateKurikulum(req.params.id, {
      NAMA_KURIKULUM,
      TAHUN,
      DESKRIPSI,
      STATUS,
    });

    if (!updatedKurikulum) {
      return res.status(404).json({ message: "Kurikulum tidak ditemukan" });
    }

    res.status(200).json(updatedKurikulum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus kurikulum berdasarkan ID
 */
export const deleteKurikulum = async (req, res) => {
  try {
    const deleted = await KurikulumModel.deleteKurikulum(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Kurikulum tidak ditemukan" });
    }

    res.status(200).json({ message: "Kurikulum berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
