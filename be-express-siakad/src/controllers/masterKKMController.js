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
      TAHUN_AJARAN_ID, // ✅ WAJIB ADA
      KOMPLEKSITAS,
      DAYA_DUKUNG,
      INTAKE,
      KETERANGAN,
      STATUS,
    } = req.body;

    // ✅ Validasi field wajib (TAMBAH TAHUN_AJARAN_ID)
    if (!KODE_MAPEL || !TAHUN_AJARAN_ID || KOMPLEKSITAS === undefined || DAYA_DUKUNG === undefined || INTAKE === undefined) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (KODE_MAPEL, TAHUN_AJARAN_ID, KOMPLEKSITAS, DAYA_DUKUNG, INTAKE)",
      });
    }

    // Validasi nilai numeric
    if (isNaN(KOMPLEKSITAS) || isNaN(DAYA_DUKUNG) || isNaN(INTAKE)) {
      return res.status(400).json({
        status: "99",
        message: "KOMPLEKSITAS, DAYA_DUKUNG, dan INTAKE harus berupa angka",
      });
    }

    // ✅ CEK DUPLIKAT: Satu mapel hanya boleh punya 1 KKM per tahun ajaran
    const existing = await MasterKKMModel.checkDuplicate(KODE_MAPEL, TAHUN_AJARAN_ID);
    if (existing) {
      return res.status(409).json({
        status: "99",
        message: `KKM untuk mapel ${KODE_MAPEL} tahun ajaran ${TAHUN_AJARAN_ID} sudah ada`,
      });
    }

    // 🔹 Hitung nilai KKM otomatis
    const KKM = Math.round((Number(KOMPLEKSITAS) + Number(DAYA_DUKUNG) + Number(INTAKE)) / 3);

    // 🔹 Auto-generate kode KKM baru
    const KODE_KKM = await MasterKKMModel.generateKodeKKM();

    const result = await MasterKKMModel.createKKM({
      KODE_KKM,
      KODE_MAPEL,
      TAHUN_AJARAN_ID, // ✅ TAMBAHKAN
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
        message: "KKM untuk mapel dan tahun ajaran ini sudah ada",
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
      TAHUN_AJARAN_ID, // ✅ WAJIB ADA
      KOMPLEKSITAS,
      DAYA_DUKUNG,
      INTAKE,
      KETERANGAN,
      STATUS,
    } = req.body;

    // ✅ Validasi field wajib
    if (!KODE_MAPEL || !TAHUN_AJARAN_ID || KOMPLEKSITAS === undefined || DAYA_DUKUNG === undefined || INTAKE === undefined) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (KODE_MAPEL, TAHUN_AJARAN_ID, KOMPLEKSITAS, DAYA_DUKUNG, INTAKE)",
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

    // ✅ CEK DUPLIKAT (kecuali diri sendiri)
    const duplicate = await MasterKKMModel.checkDuplicateExcept(KODE_MAPEL, TAHUN_AJARAN_ID, id);
    if (duplicate) {
      return res.status(409).json({
        status: "99",
        message: `KKM untuk mapel ${KODE_MAPEL} tahun ajaran ${TAHUN_AJARAN_ID} sudah ada`,
      });
    }

    // 🔹 Hitung ulang KKM otomatis
    const KKM = Math.round((Number(KOMPLEKSITAS) + Number(DAYA_DUKUNG) + Number(INTAKE)) / 3);

    const updated = await MasterKKMModel.updateKKM(id, {
      KODE_KKM: existing.KODE_KKM, // Gunakan kode KKM yang sudah ada
      KODE_MAPEL,
      TAHUN_AJARAN_ID, // ✅ TAMBAHKAN
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
