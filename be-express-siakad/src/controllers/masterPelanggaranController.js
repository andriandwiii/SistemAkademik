import * as MasterPelanggaranModel from "../models/masterPelanggaranModel.js";

/**
 * GET semua master pelanggaran
 */
export const getAllMasterPelanggaran = async (req, res) => {
  try {
    const data = await MasterPelanggaranModel.getAllMasterPelanggaran();

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data master pelanggaran",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data master pelanggaran berhasil diambil",
      data: data.map(item => ({
        id: item.ID,
        KODE_PELANGGARAN: item.KODE_PELANGGARAN,
        NAMA_PELANGGARAN: item.NAMA_PELANGGARAN,
        KATEGORI: item.KATEGORI,
        BOBOT_POIN: item.BOBOT_POIN,
        TINDAKAN_DEFAULT: item.TINDAKAN_DEFAULT,
        created_at: item.created_at,
        updated_at: item.updated_at
      })),
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data master pelanggaran",
      error: err.message,
    });
  }
};

/**
 * GET master pelanggaran by ID
 */
export const getMasterPelanggaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MasterPelanggaranModel.getMasterPelanggaranById(id);

    if (!item) {
      return res.status(404).json({
        status: "04",
        message: "Data pelanggaran tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data master pelanggaran berhasil diambil",
      data: {
        id: item.ID,
        KODE_PELANGGARAN: item.KODE_PELANGGARAN,
        NAMA_PELANGGARAN: item.NAMA_PELANGGARAN,
        KATEGORI: item.KATEGORI,
        BOBOT_POIN: item.BOBOT_POIN,
        TINDAKAN_DEFAULT: item.TINDAKAN_DEFAULT,
        created_at: item.created_at,
        updated_at: item.updated_at
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data master pelanggaran",
      error: err.message,
    });
  }
};

/**
 * CREATE master pelanggaran baru
 */
export const createMasterPelanggaran = async (req, res) => {
  try {
    const { KODE_PELANGGARAN, NAMA_PELANGGARAN, KATEGORI, BOBOT_POIN, TINDAKAN_DEFAULT } = req.body;

    if (!KODE_PELANGGARAN || !NAMA_PELANGGARAN) {
      return res.status(400).json({
        status: "01",
        message: "KODE_PELANGGARAN dan NAMA_PELANGGARAN wajib diisi",
      });
    }

    // Pastikan bobot poin adalah angka
    const poin = parseInt(BOBOT_POIN) || 0;

    const newItem = await MasterPelanggaranModel.createMasterPelanggaran({
      KODE_PELANGGARAN,
      NAMA_PELANGGARAN,
      KATEGORI,
      BOBOT_POIN: poin,
      TINDAKAN_DEFAULT,
    });

    res.status(201).json({
      status: "00",
      message: "Master pelanggaran berhasil ditambahkan",
      data: newItem,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan master pelanggaran",
      error: err.message,
    });
  }
};

/**
 * UPDATE master pelanggaran
 */
export const updateMasterPelanggaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { KODE_PELANGGARAN, NAMA_PELANGGARAN, KATEGORI, BOBOT_POIN, TINDAKAN_DEFAULT } = req.body;

    const existing = await MasterPelanggaranModel.getMasterPelanggaranById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Data tidak ditemukan untuk diperbarui",
      });
    }

    const updatedItem = await MasterPelanggaranModel.updateMasterPelanggaran(id, {
      KODE_PELANGGARAN,
      NAMA_PELANGGARAN,
      KATEGORI,
      BOBOT_POIN: parseInt(BOBOT_POIN) || 0,
      TINDAKAN_DEFAULT,
    });

    res.status(200).json({
      status: "00",
      message: "Master pelanggaran berhasil diperbarui",
      data: updatedItem,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui master pelanggaran",
      error: err.message,
    });
  }
};

/**
 * DELETE master pelanggaran
 */
export const deleteMasterPelanggaran = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterPelanggaranModel.getMasterPelanggaranById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Data tidak ditemukan untuk dihapus",
      });
    }

    await MasterPelanggaranModel.deleteMasterPelanggaran(id);

    res.status(200).json({
      status: "00",
      message: "Master pelanggaran berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus data",
      error: err.message,
    });
  }
};