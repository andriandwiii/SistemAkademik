import * as MasterJamPelajaranModel from "../models/masterJamPelajaranModel.js";

/**
 * GET semua jam pelajaran
 */
export const getAllJamPelajaran = async (req, res) => {
  try {
    const jamPelajaran = await MasterJamPelajaranModel.getAllJamPelajaran();

    if (!jamPelajaran || jamPelajaran.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data jam pelajaran",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jam pelajaran berhasil diambil",
      data: jamPelajaran,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jam pelajaran",
      error: err.message,
    });
  }
};

/**
 * GET jam pelajaran by ID
 */
export const getJamPelajaranById = async (req, res) => {
  try {
    const { ID } = req.params;
    const jp = await MasterJamPelajaranModel.getJamPelajaranById(ID);

    if (!jp) {
      return res.status(404).json({
        status: "04",
        message: "Jam pelajaran tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jam pelajaran berhasil diambil",
      data: jp,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jam pelajaran",
      error: err.message,
    });
  }
};

/**
 * CREATE jam pelajaran baru
 */
export const createJamPelajaran = async (req, res) => {
  try {
    const { KODE_JP, JP_KE, WAKTU_MULAI, WAKTU_SELESAI, DURASI, DESKRIPSI } = req.body;

    if (!KODE_JP || !JP_KE || !WAKTU_MULAI || !WAKTU_SELESAI) {
      return res.status(400).json({
        status: "01",
        message: "KODE_JP, JP_KE, WAKTU_MULAI, dan WAKTU_SELESAI wajib diisi",
      });
    }

    const existing = await MasterJamPelajaranModel.getJamPelajaranByKode(KODE_JP);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: "KODE_JP sudah terdaftar",
      });
    }

    const newJP = await MasterJamPelajaranModel.createJamPelajaran({
      KODE_JP,
      JP_KE,
      WAKTU_MULAI,
      WAKTU_SELESAI,
      DURASI,
      DESKRIPSI,
    });

    res.status(201).json({
      status: "00",
      message: "Jam pelajaran berhasil ditambahkan",
      data: newJP,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan jam pelajaran",
      error: err.message,
    });
  }
};

/**
 * UPDATE jam pelajaran
 */
export const updateJamPelajaran = async (req, res) => {
  try {
    const { ID } = req.params;
    const { KODE_JP, JP_KE, WAKTU_MULAI, WAKTU_SELESAI, DURASI, DESKRIPSI } = req.body;

    const existing = await MasterJamPelajaranModel.getJamPelajaranById(ID);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jam pelajaran tidak ditemukan untuk diperbarui",
      });
    }

    if (!WAKTU_MULAI || !WAKTU_SELESAI) {
      return res.status(400).json({
        status: "01",
        message: "WAKTU_MULAI dan WAKTU_SELESAI wajib diisi",
      });
    }

    const updatedJP = await MasterJamPelajaranModel.updateJamPelajaran(ID, {
      KODE_JP,
      JP_KE,
      WAKTU_MULAI,
      WAKTU_SELESAI,
      DURASI,
      DESKRIPSI,
    });

    res.status(200).json({
      status: "00",
      message: "Jam pelajaran berhasil diperbarui",
      data: updatedJP,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui jam pelajaran",
      error: err.message,
    });
  }
};

/**
 * DELETE jam pelajaran
 */
export const deleteJamPelajaran = async (req, res) => {
  try {
    const { ID } = req.params;
    const existing = await MasterJamPelajaranModel.getJamPelajaranById(ID);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jam pelajaran tidak ditemukan untuk dihapus",
      });
    }

    await MasterJamPelajaranModel.deleteJamPelajaran(ID);

    res.status(200).json({
      status: "00",
      message: "Jam pelajaran berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus jam pelajaran",
      error: err.message,
    });
  }
};
