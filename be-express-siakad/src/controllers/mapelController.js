import * as MapelModel from "../models/mapelModel.js";

/** Ambil semua mapel */
export const getAllMapel = async (req, res) => {
  try {
    const data = await MapelModel.getAllMapel();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil mapel by ID */
export const getMapelById = async (req, res) => {
  try {
    const data = await MapelModel.getMapelById(req.params.id);
    if (!data) return res.status(404).json({ status: "error", message: "Mapel tidak ditemukan" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah mapel */
export const createMapel = async (req, res) => {
  try {
    const { KODE_MAPEL, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;

    if (!KODE_MAPEL || !NAMA_MAPEL || !KATEGORI) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const mapel = await MapelModel.createMapel({
      KODE_MAPEL,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS
    });

    res.status(201).json({ status: "success", data: mapel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update mapel */
export const updateMapel = async (req, res) => {
  try {
    const { KODE_MAPEL, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;
    const { id } = req.params;

    if (!KODE_MAPEL || !NAMA_MAPEL || !KATEGORI) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const mapel = await MapelModel.updateMapel(id, {
      KODE_MAPEL,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS
    });

    if (!mapel) return res.status(404).json({ status: "error", message: "Mapel tidak ditemukan" });

    res.status(200).json({ status: "success", data: mapel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus mapel */
export const deleteMapel = async (req, res) => {
  try {
    const deleted = await MapelModel.deleteMapel(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Mapel tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Mapel berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
