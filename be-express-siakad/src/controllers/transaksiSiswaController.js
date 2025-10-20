import * as TransaksiModel from "../models/transaksiSiswaModel.js";

/** Ambil semua transaksi */
export const getAllTransaksi = async (req, res) => {
  try {
    const data = await TransaksiModel.getAllTransaksi();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error("❌ Error getAllTransaksi:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah siswa ke kelas */
export const createTransaksi = async (req, res) => {
  try {
    const { SISWA_ID, KELAS_ID, TAHUN_AJARAN, STATUS } = req.body;

    if (!SISWA_ID || !KELAS_ID || !TAHUN_AJARAN) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const transaksi = await TransaksiModel.createTransaksi({
      SISWA_ID,
      KELAS_ID,
      TAHUN_AJARAN,
      STATUS: STATUS || "Aktif",
    });

    res.status(201).json({ status: "success", data: transaksi });
  } catch (err) {
    console.error("❌ Error createTransaksi:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update transaksi */
export const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { SISWA_ID, KELAS_ID, TAHUN_AJARAN, STATUS } = req.body;

    if (!SISWA_ID || !KELAS_ID || !TAHUN_AJARAN) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const transaksi = await TransaksiModel.updateTransaksi(id, {
      SISWA_ID,
      KELAS_ID,
      TAHUN_AJARAN,
      STATUS,
    });

    if (!transaksi) {
      return res
        .status(404)
        .json({ status: "error", message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data: transaksi });
  } catch (err) {
    console.error("❌ Error updateTransaksi:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus transaksi */
export const deleteTransaksi = async (req, res) => {
  try {
    const deleted = await TransaksiModel.deleteTransaksi(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Transaksi tidak ditemukan" });

    res
      .status(200)
      .json({ status: "success", message: "Transaksi berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteTransaksi:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
