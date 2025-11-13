import * as MasterKKMModel from "../models/masterKKMModel.js";

/** 🔹 Ambil semua data KKM */
export const getAllKKM = async (req, res) => {
  try {
    const data = await MasterKKMModel.getAllKKM();
    res.status(200).json({
      status: "00",
      message: "Data KKM berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllKKM:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah data KKM baru (KKM dihitung otomatis) */
export const createKKM = async (req, res) => {
  try {
    const {
      KODE_MAPEL,
      KOMPLEKSITAS,
      DAYA_DUKUNG,
      INTAKE,
      KETERANGAN,
      STATUS,
    } = req.body;

    // Validasi field wajib
    if (!KODE_MAPEL || KOMPLEKSITAS === undefined || DAYA_DUKUNG === undefined || INTAKE === undefined) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (KODE_MAPEL, KOMPLEKSITAS, DAYA_DUKUNG, INTAKE)",
      });
    }

    // Validasi nilai numeric
    if (isNaN(KOMPLEKSITAS) || isNaN(DAYA_DUKUNG) || isNaN(INTAKE)) {
      return res.status(400).json({
        status: "99",
        message: "KOMPLEKSITAS, DAYA_DUKUNG, dan INTAKE harus berupa angka",
      });
    }

    // 🔹 Hitung nilai KKM otomatis
    const KKM = Math.round((Number(KOMPLEKSITAS) + Number(DAYA_DUKUNG) + Number(INTAKE)) / 3);

    // 🔹 Auto-generate kode KKM baru
    const KODE_KKM = await MasterKKMModel.generateKodeKKM();

    const result = await MasterKKMModel.createKKM({
      KODE_KKM,
      KODE_MAPEL,
      KOMPLEKSITAS: Number(KOMPLEKSITAS),
      DAYA_DUKUNG: Number(DAYA_DUKUNG),
      INTAKE: Number(INTAKE),
      KKM,
      KETERANGAN: KETERANGAN || "-",
      STATUS: STATUS || "Aktif",
    });

    res.status(201).json({
      status: "00",
      message: "Data KKM berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createKKM:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Kode KKM sudah digunakan",
      });
    }

    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update data KKM (KKM dihitung ulang otomatis) */
export const updateKKM = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      KODE_MAPEL,
      KOMPLEKSITAS,
      DAYA_DUKUNG,
      INTAKE,
      KETERANGAN,
      STATUS,
    } = req.body;

    // Validasi field wajib - KODE_KKM tidak perlu dikirim dari frontend
    if (!KODE_MAPEL || KOMPLEKSITAS === undefined || DAYA_DUKUNG === undefined || INTAKE === undefined) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (KODE_MAPEL, KOMPLEKSITAS, DAYA_DUKUNG, INTAKE)",
      });
    }

    // Validasi nilai numeric
    if (isNaN(KOMPLEKSITAS) || isNaN(DAYA_DUKUNG) || isNaN(INTAKE)) {
      return res.status(400).json({
        status: "99",
        message: "KOMPLEKSITAS, DAYA_DUKUNG, dan INTAKE harus berupa angka",
      });
    }

    // 🔹 Cek data apakah ada
    const existing = await MasterKKMModel.getKKMById(id);
    if (!existing) {
      return res.status(404).json({
        status: "99",
        message: "Data KKM tidak ditemukan",
      });
    }

    // 🔹 Hitung ulang KKM otomatis
    const KKM = Math.round((Number(KOMPLEKSITAS) + Number(DAYA_DUKUNG) + Number(INTAKE)) / 3);

    const updated = await MasterKKMModel.updateKKM(id, {
      KODE_KKM: existing.KODE_KKM, // Gunakan kode KKM yang sudah ada
      KODE_MAPEL,
      KOMPLEKSITAS: Number(KOMPLEKSITAS),
      DAYA_DUKUNG: Number(DAYA_DUKUNG),
      INTAKE: Number(INTAKE),
      KKM,
      KETERANGAN: KETERANGAN || "-",
      STATUS: STATUS || "Aktif",
    });

    res.status(200).json({
      status: "00",
      message: "Data KKM berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateKKM:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Kode KKM sudah digunakan",
      });
    }
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus data KKM */
export const deleteKKM = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MasterKKMModel.deleteKKM(id);

    if (!deleted) {
      return res.status(404).json({
        status: "99",
        message: "Data KKM tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data KKM berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteKKM:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};