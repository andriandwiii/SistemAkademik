import * as TingkatanModel from "../models/masterTingkatanModel.js";

/** Ambil semua tingkatan */
export const getAllTingkatan = async (req, res) => {
  try {
    const data = await TingkatanModel.getAllTingkatan();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil tingkatan by ID */
export const getTingkatanById = async (req, res) => {
  try {
    const data = await TingkatanModel.getTingkatanById(req.params.id);
    if (!data) return res.status(404).json({ status: "error", message: "Tingkatan tidak ditemukan" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah tingkatan */
export const createTingkatan = async (req, res) => {
  try {
    const { TINGKATAN, STATUS } = req.body;
    if (!TINGKATAN) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }
    const tingkatan = await TingkatanModel.createTingkatan({ TINGKATAN, STATUS });
    res.status(201).json({ status: "success", data: tingkatan });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update tingkatan */
export const updateTingkatan = async (req, res) => {
  try {
    const { TINGKATAN, STATUS } = req.body;
    const { id } = req.params;

    if (!TINGKATAN) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const tingkatan = await TingkatanModel.updateTingkatan(id, { TINGKATAN, STATUS });
    if (!tingkatan) return res.status(404).json({ status: "error", message: "Tingkatan tidak ditemukan" });

    res.status(200).json({ status: "success", data: tingkatan });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus tingkatan */
export const deleteTingkatan = async (req, res) => {
  try {
    const deleted = await TingkatanModel.deleteTingkatan(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Tingkatan tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Tingkatan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
