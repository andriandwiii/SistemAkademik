import * as RuangModel from "../models/masterRuangKelasModel.js";

/** Ambil semua ruang kelas */
export const getAllRuang = async (req, res) => {
  try {
    const data = await RuangModel.getAllRuang();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil ruang kelas by ID */
export const getRuangById = async (req, res) => {
  try {
    const data = await RuangModel.getRuangById(req.params.id);
    if (!data) return res.status(404).json({ status: "error", message: "Ruang tidak ditemukan" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah ruang kelas */
export const createRuang = async (req, res) => {
  try {
    const { NAMA_RUANG, DESKRIPSI } = req.body;
    if (!NAMA_RUANG) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }
    const ruang = await RuangModel.createRuang({ NAMA_RUANG, DESKRIPSI });
    res.status(201).json({ status: "success", data: ruang });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update ruang kelas */
export const updateRuang = async (req, res) => {
  try {
    const { NAMA_RUANG, DESKRIPSI } = req.body;
    const { id } = req.params;

    if (!NAMA_RUANG) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const ruang = await RuangModel.updateRuang(id, { NAMA_RUANG, DESKRIPSI });
    if (!ruang) return res.status(404).json({ status: "error", message: "Ruang tidak ditemukan" });

    res.status(200).json({ status: "success", data: ruang });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus ruang kelas */
export const deleteRuang = async (req, res) => {
  try {
    const deleted = await RuangModel.deleteRuang(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Ruang tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Ruang berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
