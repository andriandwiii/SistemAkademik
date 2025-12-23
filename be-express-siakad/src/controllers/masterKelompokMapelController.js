import * as KelompokMapelModel from "../models/MasterKelompokMapelModel.js";

/** 🔹 Ambil semua data Kelompok Mapel */
export const getAllKelompokMapel = async (req, res) => {
  try {
    const data = await KelompokMapelModel.getAllKelompokMapel();
    res.status(200).json({
      status: "00",
      message: "Data Kelompok Mapel berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllKelompokMapel:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah data Kelompok Mapel baru */
export const createKelompokMapel = async (req, res) => {
  try {
    const { KELOMPOK, NAMA_KELOMPOK, STATUS } = req.body;

    // ✅ Validasi field wajib
    if (!KELOMPOK || !NAMA_KELOMPOK) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (KELOMPOK, NAMA_KELOMPOK)",
      });
    }

    // ✅ CEK DUPLIKAT: Pastikan kode kelompok (A, B, C, dst) belum ada
    const existing = await KelompokMapelModel.checkDuplicateKelompok(KELOMPOK);
    if (existing) {
      return res.status(409).json({
        status: "99",
        message: `Kelompok '${KELOMPOK}' sudah ada dalam database`,
      });
    }

    const result = await KelompokMapelModel.createKelompokMapel({
      KELOMPOK,
      NAMA_KELOMPOK,
      STATUS: STATUS || "Aktif",
    });

    res.status(201).json({
      status: "00",
      message: "Data Kelompok Mapel berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createKelompokMapel:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update data Kelompok Mapel */
export const updateKelompokMapel = async (req, res) => {
  try {
    const { id } = req.params;
    const { KELOMPOK, NAMA_KELOMPOK, STATUS } = req.body;

    // ✅ Validasi field wajib
    if (!KELOMPOK || !NAMA_KELOMPOK) {
      return res.status(400).json({
        status: "99",
        message: "KELOMPOK dan NAMA_KELOMPOK wajib diisi",
      });
    }

    // 🔹 Cek data apakah ada
    const currentData = await KelompokMapelModel.getKelompokMapelById(id);
    if (!currentData) {
      return res.status(404).json({
        status: "99",
        message: "Data Kelompok Mapel tidak ditemukan",
      });
    }

    // ✅ CEK DUPLIKAT (kecuali ID yang sedang diupdate)
    const duplicate = await KelompokMapelModel.checkDuplicateExcept(KELOMPOK, id);
    if (duplicate) {
      return res.status(409).json({
        status: "99",
        message: `Kelompok '${KELOMPOK}' sudah digunakan oleh data lain`,
      });
    }

    const updated = await KelompokMapelModel.updateKelompokMapel(id, {
      KELOMPOK,
      NAMA_KELOMPOK,
      STATUS: STATUS || "Aktif",
    });

    res.status(200).json({
      status: "00",
      message: "Data Kelompok Mapel berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateKelompokMapel:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus data Kelompok Mapel */
export const deleteKelompokMapel = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await KelompokMapelModel.deleteKelompokMapel(id);

    if (!deleted) {
      return res.status(404).json({
        status: "99",
        message: "Data Kelompok Mapel tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data Kelompok Mapel berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteKelompokMapel:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};