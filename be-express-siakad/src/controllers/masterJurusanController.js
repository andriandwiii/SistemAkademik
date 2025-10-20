import * as MasterJurusanModel from "../models/masterJurusanModel.js";

/**
 * GET semua jurusan
 */
export const getAllJurusan = async (req, res) => {
  try {
    const jurusan = await MasterJurusanModel.getAllJurusan();

    if (!jurusan || jurusan.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data jurusan",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jurusan berhasil diambil",
      data: jurusan,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jurusan",
      error: err.message,
    });
  }
};

/**
 * GET jurusan by ID
 */
export const getJurusanById = async (req, res) => {
  try {
    const { id } = req.params;
    const jurusan = await MasterJurusanModel.getJurusanById(id);

    if (!jurusan) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jurusan berhasil diambil",
      data: jurusan,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jurusan",
      error: err.message,
    });
  }
};

/**
 * CREATE jurusan baru
 */
export const createJurusan = async (req, res) => {
  try {
    const { KODE_JURUSAN, KETERANGAN } = req.body;

    if (!KODE_JURUSAN || !KETERANGAN) {
      return res.status(400).json({
        status: "01",
        message: "KODE_JURUSAN dan KETERANGAN wajib diisi",
      });
    }

    // Cek apakah kode jurusan sudah ada
    const existing = await MasterJurusanModel.getJurusanByKode(KODE_JURUSAN);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: "KODE_JURUSAN sudah terdaftar",
      });
    }

    const newJurusan = await MasterJurusanModel.createJurusan({
      KODE_JURUSAN,
      KETERANGAN,
    });

    res.status(201).json({
      status: "00",
      message: "Jurusan berhasil ditambahkan",
      data: newJurusan,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan jurusan",
      error: err.message,
    });
  }
};

/**
 * UPDATE jurusan
 */
export const updateJurusan = async (req, res) => {
  try {
    const { id } = req.params;
    const { KODE_JURUSAN, KETERANGAN } = req.body;

    if (!KODE_JURUSAN || !KETERANGAN) {
      return res.status(400).json({
        status: "01",
        message: "KODE_JURUSAN dan KETERANGAN wajib diisi",
      });
    }

    const existing = await MasterJurusanModel.getJurusanById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan untuk diperbarui",
      });
    }

    const updatedJurusan = await MasterJurusanModel.updateJurusan(id, {
      KODE_JURUSAN,
      KETERANGAN,
    });

    res.status(200).json({
      status: "00",
      message: "Jurusan berhasil diperbarui",
      data: updatedJurusan,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui jurusan",
      error: err.message,
    });
  }
};

/**
 * DELETE jurusan
 */
export const deleteJurusan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterJurusanModel.getJurusanById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan untuk dihapus",
      });
    }

    await MasterJurusanModel.deleteJurusan(id);

    res.status(200).json({
      status: "00",
      message: "Jurusan berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus jurusan",
      error: err.message,
    });
  }
};
