import * as HariModel from "../models/M.HariModel.js";

/**
 * Ambil semua hari
 */
export const getAllHari = async (req, res) => {
  try {
    const hari = await HariModel.getAllHari();
    res.status(200).json({
      status: "success",
      message: "Data hari berhasil diambil",
      data: hari,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data hari",
      error: error.message,
    });
  }
};

/**
 * Ambil hari berdasarkan ID
 */
export const getHariById = async (req, res) => {
  try {
    const { id } = req.params;
    const hari = await HariModel.getHariById(id);
    if (!hari) {
      return res.status(404).json({
        status: "warning",
        message: "Data hari tidak ditemukan",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Data hari ditemukan",
      data: hari,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data hari",
      error: error.message,
    });
  }
};

/**
 * Tambah hari baru
 */
export const addHari = async (req, res) => {
  try {
    const { NAMA_HARI, URUTAN, STATUS } = req.body;

    if (!NAMA_HARI || !URUTAN) {
      return res.status(400).json({
        status: "warning",
        message: "NAMA_HARI dan URUTAN wajib diisi",
      });
    }

    await HariModel.addHari({ NAMA_HARI, URUTAN, STATUS });

    res.status(201).json({
      status: "success",
      message: "Data hari berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data hari",
      error: error.message,
    });
  }
};

/**
 * Update hari
 */
export const updateHari = async (req, res) => {
  try {
    const { id } = req.params;
    const { NAMA_HARI, URUTAN, STATUS } = req.body;

    const existing = await HariModel.getHariById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data hari tidak ditemukan",
      });
    }

    await HariModel.updateHari(id, { NAMA_HARI, URUTAN, STATUS });

    res.status(200).json({
      status: "success",
      message: "Data hari berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data hari",
      error: error.message,
    });
  }
};

/**
 * Hapus hari
 */
export const deleteHari = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await HariModel.getHariById(id);

    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data hari tidak ditemukan",
      });
    }

    await HariModel.deleteHari(id);

    res.status(200).json({
      status: "success",
      message: "Data hari berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data hari",
      error: error.message,
    });
  }
};
