import * as MapelKelasModel from "../models/mapelKelasModel.js";

/** Ambil semua relasi mapel-kelas */
export const getAllMapelKelas = async (req, res) => {
  try {
    const data = await MapelKelasModel.getAllMapelKelas();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah relasi mapel ke kelas */
export const createMapelKelas = async (req, res) => {
  try {
    const { KELAS_ID, MAPEL_ID, GURU_ID, KODE_MAPEL } = req.body;

    if (!KELAS_ID || !MAPEL_ID || !GURU_ID || !KODE_MAPEL) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const relasi = await MapelKelasModel.createMapelKelas({
      KELAS_ID,
      MAPEL_ID,
      GURU_ID,
      KODE_MAPEL,
    });

    res.status(201).json({
      status: "success",
      message: "Data Mapel-Kelas berhasil ditambahkan",
      data: relasi,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update relasi mapel-kelas */
export const updateMapelKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { KELAS_ID, MAPEL_ID, GURU_ID, KODE_MAPEL } = req.body;

    if (!KELAS_ID || !MAPEL_ID || !GURU_ID || !KODE_MAPEL) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const relasi = await MapelKelasModel.updateMapelKelas(id, {
      KELAS_ID,
      MAPEL_ID,
      GURU_ID,
      KODE_MAPEL,
    });

    if (!relasi)
      return res
        .status(404)
        .json({ status: "error", message: "Relasi tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Data Mapel-Kelas berhasil diperbarui",
      data: relasi,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil relasi mapel-kelas by ID */
export const getMapelKelasById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MapelKelasModel.getMapelKelasById(id);

    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "Relasi tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus relasi */
export const deleteMapelKelas = async (req, res) => {
  try {
    const deleted = await MapelKelasModel.deleteMapelKelas(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Relasi tidak ditemukan" });
    res.status(200).json({
      status: "success",
      message: "Relasi berhasil dihapus",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
