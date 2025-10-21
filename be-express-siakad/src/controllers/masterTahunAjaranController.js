import * as TahunAjaranModel from "../models/masterTahunAjaranModel.js";

/**
 * GET semua tahun ajaran
 */
export const getAllTahunAjaran = async (req, res) => {
  try {
    const data = await TahunAjaranModel.getAllTahunAjaran();
    res.status(200).json({
      status: "success",
      message: "Data tahun ajaran berhasil diambil",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data tahun ajaran",
      error: error.message,
    });
  }
};

/**
 * GET tahun ajaran berdasarkan ID
 */
export const getTahunAjaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await TahunAjaranModel.getTahunAjaranById(id);

    if (!data) {
      return res.status(404).json({
        status: "warning",
        message: "Data tahun ajaran tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data tahun ajaran ditemukan",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data tahun ajaran",
      error: error.message,
    });
  }
};

/**
 * POST tambah tahun ajaran
 */
export const addTahunAjaran = async (req, res) => {
  try {
    const { TAHUN_AJARAN_ID, NAMA_TAHUN_AJARAN, STATUS } = req.body;

    if (!TAHUN_AJARAN_ID || !NAMA_TAHUN_AJARAN) {
      return res.status(400).json({
        status: "warning",
        message: "Field TAHUN_AJARAN_ID dan NAMA_TAHUN_AJARAN wajib diisi",
      });
    }

    await TahunAjaranModel.addTahunAjaran({
      TAHUN_AJARAN_ID,
      NAMA_TAHUN_AJARAN,
      STATUS: STATUS || "Tidak Aktif",
    });

    res.status(201).json({
      status: "success",
      message: "Data tahun ajaran berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data tahun ajaran",
      error: error.message,
    });
  }
};

/**
 * PUT update tahun ajaran
 */
export const updateTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { TAHUN_AJARAN_ID, NAMA_TAHUN_AJARAN, STATUS } = req.body;

    const existing = await TahunAjaranModel.getTahunAjaranById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data tahun ajaran tidak ditemukan",
      });
    }

    await TahunAjaranModel.updateTahunAjaran(id, {
      TAHUN_AJARAN_ID,
      NAMA_TAHUN_AJARAN,
      STATUS,
    });

    res.status(200).json({
      status: "success",
      message: "Data tahun ajaran berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data tahun ajaran",
      error: error.message,
    });
  }
};

/**
 * DELETE tahun ajaran
 */
export const deleteTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await TahunAjaranModel.getTahunAjaranById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: "Data tahun ajaran tidak ditemukan",
      });
    }

    await TahunAjaranModel.deleteTahunAjaran(id);

    res.status(200).json({
      status: "success",
      message: "Data tahun ajaran berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data tahun ajaran",
      error: error.message,
    });
  }
};
