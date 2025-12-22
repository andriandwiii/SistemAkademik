import * as TransaksiModel from "../models/transaksiWakelModel.js";

/** 🔹 Ambil semua transaksi guru wali kelas */
export const getAllTransaksi = async (req, res) => {
  try {
    const data = await TransaksiModel.getAllTransaksi();
    res.status(200).json({
      status: "00",
      message: "Data transaksi guru wali kelas berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah guru sebagai wali kelas */
export const createTransaksi = async (req, res) => {
  try {
    const { NIP, TINGKATAN_ID, JURUSAN_ID, KELAS_ID } = req.body;

    if (!NIP || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (NIP, TINGKATAN_ID, JURUSAN_ID, KELAS_ID)",
      });
    }

    // --- LOGIKA TAMBAHAN: CEK APAKAH GURU SUDAH JADI WAKEL ---
    const allData = await TransaksiModel.getAllTransaksi();
    const isAlreadyWakel = allData.find(item => item.NIP === NIP);

    if (isAlreadyWakel) {
      return res.status(400).json({
        status: "99",
        message: `Gagal! Guru dengan NIP ${NIP} sudah menjabat sebagai wali kelas di kelas lain.`,
      });
    }
    // --------------------------------------------------------

    const result = await TransaksiModel.createTransaksi({
      NIP,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
    });

    res.status(201).json({
      status: "00",
      message: "Guru berhasil ditambahkan sebagai wali kelas",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createTransaksi:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: "99",
        message: "Kelas ini sudah memiliki wali kelas",
      });
    }
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update transaksi guru wali kelas */
export const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { NIP, TINGKATAN_ID, JURUSAN_ID, KELAS_ID } = req.body;

    if (!NIP || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (NIP, TINGKATAN_ID, JURUSAN_ID, KELAS_ID)",
      });
    }

    // --- LOGIKA TAMBAHAN: CEK APAKAH GURU SUDAH JADI WAKEL DI TRANSAKSI LAIN ---
    const allData = await TransaksiModel.getAllTransaksi();
    // Cari apakah NIP ini sudah dipakai di ID yang berbeda dengan yang sedang di-update
    const isUsedByOther = allData.find(item => item.NIP === NIP && item.ID != id);

    if (isUsedByOther) {
      return res.status(400).json({
        status: "99",
        message: `Gagal! Guru dengan NIP ${NIP} sudah menjadi wali kelas di kelas lain.`,
      });
    }
    // -------------------------------------------------------------------------

    const updated = await TransaksiModel.updateTransaksi(id, {
      NIP,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
    });

    if (!updated) {
      return res.status(404).json({
        status: "99",
        message: "Transaksi guru wali kelas tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi guru wali kelas berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateTransaksi:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: "99",
        message: "Kelas ini sudah memiliki wali kelas",
      });
    }
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus transaksi guru wali kelas */
export const deleteTransaksi = async (req, res) => {
  try {
    const deleted = await TransaksiModel.deleteTransaksi(req.params.id);
    if (!deleted)
      return res.status(404).json({
        status: "99",
        message: "Transaksi guru wali kelas tidak ditemukan",
      });

    res.status(200).json({
      status: "00",
      message: "Transaksi guru wali kelas berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteTransaksi:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};