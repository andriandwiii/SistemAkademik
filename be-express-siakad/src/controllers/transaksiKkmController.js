import * as TransaksiKkmModel from "../models/transaksiKkmModel.js";

/* ===========================================================
 * GET ALL TRANSAKSI KKM
 * ===========================================================
 */
export const getAllTransaksiKkm = async (req, res) => {
  try {
    const data = await TransaksiKkmModel.getAllTransaksiKkm();

    res.status(200).json({
      status: "00",
      message: "Data transaksi KKM berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllTransaksiKkm:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/* ===========================================================
 * CREATE TRANSAKSI KKM
 * ===========================================================
 */
export const createTransaksiKkm = async (req, res) => {
  try {
    const { TINGKATAN_ID, JURUSAN_ID, KELAS_ID, KODE_MAPEL, TAHUN_AJARAN_ID } = req.body;

    // Validasi input
    if (!TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !KODE_MAPEL || !TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi.",
      });
    }

    // Cek apakah mapel sudah punya KKM
    const cekKkm = await TransaksiKkmModel.findKkmByKodeMapel(KODE_MAPEL);

    if (!cekKkm) {
      return res.status(400).json({
        status: "99",
        message: `Mapel ${KODE_MAPEL} belum memiliki KKM di master_kkm.`,
      });
    }

    // Simpan transaksi
    const result = await TransaksiKkmModel.createTransaksiKkm({
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
    });

    res.status(201).json({
      status: "00",
      message: "Transaksi KKM berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createTransaksiKkm:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Transaksi KKM untuk kombinasi kelas & mapel ini sudah ada",
      });
    }

    res.status(500).json({ status: "99", message: err.message });
  }
};

/* ===========================================================
 * UPDATE TRANSAKSI KKM
 * ===========================================================
 */
export const updateTransaksiKkm = async (req, res) => {
  try {
    const { id } = req.params;
    const { TINGKATAN_ID, JURUSAN_ID, KELAS_ID, KODE_MAPEL, TAHUN_AJARAN_ID } = req.body;

    if (!TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !KODE_MAPEL || !TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi.",
      });
    }

    // Cek KKM
    const cekKkm = await TransaksiKkmModel.findKkmByKodeMapel(KODE_MAPEL);

    if (!cekKkm) {
      return res.status(400).json({
        status: "99",
        message: `Mapel ${KODE_MAPEL} belum memiliki KKM.`,
      });
    }

    const updated = await TransaksiKkmModel.updateTransaksiKkm(id, {
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
    });

    if (!updated) {
      return res.status(404).json({
        status: "99",
        message: "Transaksi KKM tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi KKM berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateTransaksiKkm:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Transaksi KKM ini sudah ada",
      });
    }

    res.status(500).json({ status: "99", message: err.message });
  }
};

/* ===========================================================
 * DELETE TRANSAKSI KKM
 * ===========================================================
 */
export const deleteTransaksiKkm = async (req, res) => {
  try {
    const deleted = await TransaksiKkmModel.deleteTransaksiKkm(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "99",
        message: "Transaksi KKM tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi KKM berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteTransaksiKkm:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};
