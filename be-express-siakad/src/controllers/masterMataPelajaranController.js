import * as MataPelajaranModel from "../models/masterMataPelajaranModel.js";

/** =============================
 * GET semua mata pelajaran
 * ============================= */
export const getAllMataPelajaran = async (req, res) => {
  try {
    const data = await MataPelajaranModel.getAllMataPelajaran();

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: "warning",
        message: "Belum ada data mata pelajaran yang tersedia",
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data mata pelajaran berhasil diambil",
      jumlah_data: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data mata pelajaran",
      error: error.message,
    });
  }
};

/** =============================
 * GET mata pelajaran by ID
 * ============================= */
export const getMataPelajaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MataPelajaranModel.getMataPelajaranById(id);

    if (!data) {
      return res.status(404).json({
        status: "warning",
        message: `Data mata pelajaran dengan ID ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data mata pelajaran berhasil ditemukan",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data berdasarkan ID",
      error: error.message,
    });
  }
};

/** =============================
 * POST tambah mata pelajaran
 * ============================= */
export const addMataPelajaran = async (req, res) => {
  try {
    const { MAPEL_ID, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;

    if (!MAPEL_ID || !NAMA_MAPEL || !KATEGORI) {
      return res.status(400).json({
        status: "warning",
        message: "Field MAPEL_ID, NAMA_MAPEL, dan KATEGORI wajib diisi",
      });
    }

    const result = await MataPelajaranModel.addMataPelajaran({
      MAPEL_ID,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS: STATUS || "Aktif",
    });

    res.status(201).json({
      status: "success",
      message: "Mata pelajaran baru berhasil ditambahkan",
      data: { id_dibuat: result[0] },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data mata pelajaran",
      error: error.message,
    });
  }
};

/** =============================
 * PUT update mata pelajaran
 * ============================= */
export const updateMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { MAPEL_ID, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;

    const existing = await MataPelajaranModel.getMataPelajaranById(id);
    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: `Data mata pelajaran dengan ID ${id} tidak ditemukan`,
      });
    }

    await MataPelajaranModel.updateMataPelajaran(id, {
      MAPEL_ID,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS,
    });

    res.status(200).json({
      status: "success",
      message: `Data mata pelajaran dengan ID ${id} berhasil diperbarui`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data mata pelajaran",
      error: error.message,
    });
  }
};

/** =============================
 * DELETE mata pelajaran
 * ============================= */
export const deleteMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MataPelajaranModel.getMataPelajaranById(id);

    if (!existing) {
      return res.status(404).json({
        status: "warning",
        message: `Data mata pelajaran dengan ID ${id} tidak ditemukan`,
      });
    }

    await MataPelajaranModel.deleteMataPelajaran(id);

    res.status(200).json({
      status: "success",
      message: `Data mata pelajaran dengan ID ${id} berhasil dihapus`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data mata pelajaran",
      error: error.message,
    });
  }
};
