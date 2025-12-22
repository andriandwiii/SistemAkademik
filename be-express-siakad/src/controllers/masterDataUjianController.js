// src/controllers/masterDataUjianController.js
import * as UjianModel from "../models/masterDataUjianModel.js";

/** GET semua ujian */
export const getAllUjian = async (req, res) => {
  try {
    const data = await UjianModel.getAllUjian();

    if (!data || data.length === 0)
      return res.status(200).json({
        status: "warning",
        message: "Belum ada data ujian yang tersedia",
        data: [],
      });

    res.status(200).json({
      status: "success",
      message: "Data ujian berhasil diambil",
      jumlah_data: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data ujian",
      error: error.message,
    });
  }
};

/** GET ujian by ID */
export const getUjianById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await UjianModel.getUjianById(id);

    if (!data)
      return res.status(404).json({
        status: "warning",
        message: `Data ujian dengan ID ${id} tidak ditemukan`,
      });

    res.status(200).json({
      status: "success",
      message: "Data ujian berhasil ditemukan",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data ujian berdasarkan ID",
      error: error.message,
    });
  }
};

/** GET ujian by KODE_UJIAN */
export const getUjianByKode = async (req, res) => {
  try {
    const { kode } = req.params;
    const data = await UjianModel.getUjianByKode(kode);

    if (!data)
      return res.status(404).json({
        status: "warning",
        message: `Data ujian dengan KODE_UJIAN ${kode} tidak ditemukan`,
      });

    res.status(200).json({
      status: "success",
      message: "Data ujian berhasil ditemukan",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data ujian berdasarkan kode",
      error: error.message,
    });
  }
};

/** POST tambah ujian */
export const addUjian = async (req, res) => {
  try {
    const { KODE_UJIAN, METODE, DURASI, ACAK_SOAL, ACAK_JAWABAN, STATUS } =
      req.body;

    if (!KODE_UJIAN)
      return res.status(400).json({
        status: "warning",
        message: "Field KODE_UJIAN wajib diisi",
      });

    // Cek KODE_UJIAN ada di master_jenis_ujian
    const jenis = await UjianModel.getJenisUjianByKode(KODE_UJIAN);
    if (!jenis)
      return res.status(404).json({
        status: "warning",
        message: `Jenis ujian dengan KODE_UJIAN ${KODE_UJIAN} tidak ditemukan`,
      });

    const result = await UjianModel.addUjian({
      KODE_UJIAN,
      METODE: METODE || "CBT",
      DURASI: DURASI || 60,
      ACAK_SOAL: ACAK_SOAL || false,
      ACAK_JAWABAN: ACAK_JAWABAN || false,
      STATUS: STATUS || "Aktif",
    });

    res.status(201).json({
      status: "success",
      message: "Ujian baru berhasil ditambahkan",
      data: { id_dibuat: result.ID },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan data ujian",
      error: error.message,
    });
  }
};

/** PUT update ujian */
export const updateUjian = async (req, res) => {
  try {
    const { id } = req.params;
    const { METODE, DURASI, ACAK_SOAL, ACAK_JAWABAN, STATUS } = req.body;

    const existing = await UjianModel.getUjianById(id);
    if (!existing)
      return res.status(404).json({
        status: "warning",
        message: `Data ujian dengan ID ${id} tidak ditemukan`,
      });

    await UjianModel.updateUjian(id, {
      METODE,
      DURASI,
      ACAK_SOAL,
      ACAK_JAWABAN,
      STATUS,
    });

    res.status(200).json({
      status: "success",
      message: `Data ujian dengan ID ${id} berhasil diperbarui`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data ujian",
      error: error.message,
    });
  }
};

/** DELETE ujian */
export const deleteUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await UjianModel.getUjianById(id);
    if (!existing)
      return res.status(404).json({
        status: "warning",
        message: `Data ujian dengan ID ${id} tidak ditemukan`,
      });

    await UjianModel.deleteUjian(id);

    res.status(200).json({
      status: "success",
      message: `Data ujian dengan ID ${id} berhasil dihapus`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data ujian",
      error: error.message,
    });
  }
};
