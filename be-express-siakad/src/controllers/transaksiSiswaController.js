import * as TransaksiModel from "../models/transaksiSiswaModel.js";

/** 🔹 Ambil semua transaksi siswa */
export const getAllTransaksi = async (req, res) => {
  try {
    const data = await TransaksiModel.getAllTransaksi();
    res.status(200).json({
      status: "00",
      message: "Data transaksi siswa berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah siswa ke kelas (TRANSAKSI_ID wajib diisi manual) */
export const createTransaksi = async (req, res) => {
  try {
    const { TRANSAKSI_ID, NIS, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, TAHUN_AJARAN_ID } = req.body;

    // Validasi field wajib
    if (!TRANSAKSI_ID || !NIS || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message:
          "Semua field wajib diisi (TRANSAKSI_ID, NIS, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, TAHUN_AJARAN_ID)",
      });
    }

    const result = await TransaksiModel.createTransaksi({
      TRANSAKSI_ID,
      NIS,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      TAHUN_AJARAN_ID,
    });

    res.status(201).json({
      status: "00",
      message: "Transaksi siswa berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update transaksi siswa */
export const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { NIS, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, TAHUN_AJARAN_ID } = req.body;

    if (!NIS || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message:
          "Semua field wajib diisi (NIS, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, TAHUN_AJARAN_ID)",
      });
    }

    const updated = await TransaksiModel.updateTransaksi(id, {
      NIS,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      TAHUN_AJARAN_ID,
    });

    if (!updated) {
      return res.status(404).json({
        status: "99",
        message: "Transaksi siswa tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi siswa berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus transaksi siswa */
export const deleteTransaksi = async (req, res) => {
  try {
    const deleted = await TransaksiModel.deleteTransaksi(req.params.id);
    if (!deleted)
      return res.status(404).json({
        status: "99",
        message: "Transaksi siswa tidak ditemukan",
      });

    res.status(200).json({
      status: "00",
      message: "Transaksi siswa berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};
