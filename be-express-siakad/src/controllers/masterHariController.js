import * as HariModel from "../models/masterHariModel.js";

/** Ambil semua hari */
export const getAllHari = async (req, res) => {
  try {
    const data = await HariModel.getAllHari();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil hari by ID */
export const getHariById = async (req, res) => {
  try {
    const data = await HariModel.getHariById(req.params.id);
    if (!data) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah hari */
export const createHari = async (req, res) => {
  try {
    const { NAMA_HARI, URUTAN, STATUS } = req.body;
    if (!NAMA_HARI || !URUTAN) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }
    const hari = await HariModel.createHari({ NAMA_HARI, URUTAN, STATUS });
    res.status(201).json({ status: "success", data: hari });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update hari */
export const updateHari = async (req, res) => {
  try {
    const { NAMA_HARI, URUTAN, STATUS } = req.body;
    const { id } = req.params;

    if (!NAMA_HARI || !URUTAN) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const hari = await HariModel.updateHari(id, { NAMA_HARI, URUTAN, STATUS });
    if (!hari) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });

    res.status(200).json({ status: "success", data: hari });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus hari */
export const deleteHari = async (req, res) => {
  try {
    const deleted = await HariModel.deleteHari(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Hari berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
