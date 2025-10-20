import * as MasterWilayahModel from "../models/masterWilayahModel.js";

/**
 * Ambil semua data wilayah
 */
export const getAllWilayah = async (req, res) => {
  try {
    const wilayah = await MasterWilayahModel.getAllWilayah();
    res.status(200).json(wilayah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil wilayah berdasarkan ID
 */
export const getWilayahById = async (req, res) => {
  try {
    const wilayah = await MasterWilayahModel.getWilayahById(req.params.id);
    if (!wilayah) {
      return res.status(404).json({ message: "Wilayah tidak ditemukan" });
    }
    res.status(200).json(wilayah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah wilayah baru
 */
export const createWilayah = async (req, res) => {
  try {
    const { PROVINSI, KABUPATEN, KECAMATAN, DESA_KELURAHAN, KODEPOS, RT, RW, JALAN } = req.body;

    if (!PROVINSI || !KABUPATEN || !KECAMATAN) {
      return res.status(400).json({ message: "PROVINSI, KABUPATEN, dan KECAMATAN wajib diisi" });
    }

    const newWilayah = await MasterWilayahModel.createWilayah({
      PROVINSI,
      KABUPATEN,
      KECAMATAN,
      DESA_KELURAHAN,
      KODEPOS,
      RT,
      RW,
      JALAN,
    });

    res.status(201).json(newWilayah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update wilayah berdasarkan ID
 */
export const updateWilayah = async (req, res) => {
  try {
    const { PROVINSI, KABUPATEN, KECAMATAN, DESA_KELURAHAN, KODEPOS, RT, RW, JALAN } = req.body;

    const updatedWilayah = await MasterWilayahModel.updateWilayah(req.params.id, {
      PROVINSI,
      KABUPATEN,
      KECAMATAN,
      DESA_KELURAHAN,
      KODEPOS,
      RT,
      RW,
      JALAN,
    });

    if (!updatedWilayah) {
      return res.status(404).json({ message: "Wilayah tidak ditemukan" });
    }

    res.status(200).json(updatedWilayah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus wilayah berdasarkan ID
 */
export const deleteWilayah = async (req, res) => {
  try {
    const deleted = await MasterWilayahModel.deleteWilayah(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Wilayah tidak ditemukan" });
    }

    res.status(200).json({ message: "Wilayah berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
