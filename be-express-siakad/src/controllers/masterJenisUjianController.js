import * as JenisUjianModel from "../models/masterJenisUjianModel.js";

/**
 * Ambil semua jenis ujian
 */
export const getAllJenisUjian = async (req, res) => {
  try {
    const jenisUjian = await JenisUjianModel.getAllJenisUjian();
    res.status(200).json({
      status: "success",
      message: "Data jenis ujian berhasil diambil",
      data: jenisUjian,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data jenis ujian",
      error: error.message,
    });
  }
};

/**
 * Ambil jenis ujian berdasarkan ID
 */
export const getJenisUjianById = async (req, res) => {
  try {
    const { id } = req.params;
    const jenisUjian = await JenisUjianModel.getJenisUjianById(id);

    if (!jenisUjian) {
      return res.status(404).json({
        status: "warning",
        message: "Data jenis ujian tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data jenis ujian ditemukan",
      data: jenisUjian,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data jenis ujian",
      error: error.message,
    });
  }
};

/**
 * Tambah jenis ujian baru
 */
export const addJenisUjian = async (req, res) => {
  try {
    const { KODE_UJIAN, NAMA_UJIAN, STATUS } = req.body;

    if (!KODE_UJIAN || !NAMA_UJIAN) {
      return res.status(400).json({
        status: "warning",
        message: "KODE_UJIAN dan NAMA_UJIAN wajib diisi",
      });
    }

    await JenisUjianModel.addJenisUjian({
      KODE_UJIAN,
      NAMA_UJIAN,
      STATUS,
    });

    res.status(201).json({
      status: "success",
      message: "Data jenis ujian berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data jenis ujian",
      error: error.message,
    });
  }
};

/**
 * Update jenis ujian
 */
export const updateJenisUjian = async (req, res) => {
  try {
    const { id } = req.params;
    const { KODE_UJIAN, NAMA_UJIAN, STATUS } = req.body;

    const existing = await JenisUjianModel.getJenisUjianById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data jenis ujian tidak ditemukan",
      });
    }

    await JenisUjianModel.updateJenisUjian(id, {
      KODE_UJIAN,
      NAMA_UJIAN,
      STATUS,
    });

    res.status(200).json({
      status: "success",
      message: "Data jenis ujian berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data jenis ujian",
      error: error.message,
    });
  }
};

/**
 * Hapus jenis ujian
 */
export const deleteJenisUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await JenisUjianModel.getJenisUjianById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data jenis ujian tidak ditemukan",
      });
    }

    await JenisUjianModel.deleteJenisUjian(id);

    res.status(200).json({
      status: "success",
      message: "Data jenis ujian berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data jenis ujian",
      error: error.message,
    });
  }
};
