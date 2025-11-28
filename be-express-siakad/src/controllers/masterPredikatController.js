import * as PredikatModel from "../models/masterPredikatModel.js";

/** 🔹 Ambil semua data predikat */
export const getAllPredikat = async (req, res) => {
  try {
    const data = await PredikatModel.getAllPredikat();
    res.status(200).json({
      status: "00",
      message: "Data deskripsi predikat berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllPredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah Predikat (Per Mapel + Tahun Ajaran) */
export const createPredikat = async (req, res) => {
  try {
    const {
      KODE_MAPEL,        // ✅ Wajib
      TAHUN_AJARAN_ID,   // ✅ Wajib
      DESKRIPSI_A, 
      DESKRIPSI_B, 
      DESKRIPSI_C, 
      DESKRIPSI_D
    } = req.body;

    // 1. Validasi Input Dasar
    if (!KODE_MAPEL || !TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message: "Field KODE_MAPEL dan TAHUN_AJARAN_ID wajib diisi",
      });
    }

    // 2. ✅ CEK DUPLIKAT: Hanya 1 predikat per (mapel + tahun ajaran)
    const existing = await PredikatModel.checkDuplicate(
      KODE_MAPEL,
      TAHUN_AJARAN_ID
    );

    if (existing) {
      return res.status(409).json({
        status: "99",
        message: `Predikat untuk mata pelajaran ${KODE_MAPEL} tahun ajaran ${TAHUN_AJARAN_ID} sudah ada`,
      });
    }

    // 3. Simpan Data
    const result = await PredikatModel.createPredikat({
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
      DESKRIPSI_A, 
      DESKRIPSI_B, 
      DESKRIPSI_C, 
      DESKRIPSI_D
    });

    res.status(201).json({
      status: "00",
      message: "Deskripsi Predikat berhasil ditambahkan",
      data: result,
    });

  } catch (err) {
    console.error("❌ Error createPredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update Predikat */
export const updatePredikat = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body;

    // Cek data lama
    const oldData = await PredikatModel.getPredikatById(id);
    if (!oldData) {
      return res.status(404).json({
        status: "99", 
        message: "Data tidak ditemukan"
      });
    }

    // Jika ada perubahan mapel/tahun, cek duplikat
    if (dataUpdate.KODE_MAPEL || dataUpdate.TAHUN_AJARAN_ID) {
      const mapel = dataUpdate.KODE_MAPEL || oldData.KODE_MAPEL;
      const tahun = dataUpdate.TAHUN_AJARAN_ID || oldData.TAHUN_AJARAN_ID;

      const duplicate = await PredikatModel.checkDuplicateExcept(
        mapel,
        tahun,
        id
      );

      if (duplicate) {
        return res.status(409).json({
          status: "99",
          message: "Predikat untuk mata pelajaran dan tahun ajaran ini sudah ada",
        });
      }
    }

    const updated = await PredikatModel.updatePredikat(id, dataUpdate);
    
    res.status(200).json({
      status: "00",
      message: "Deskripsi Predikat berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updatePredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus Predikat */
export const deletePredikat = async (req, res) => {
  try {
    const deleted = await PredikatModel.deletePredikat(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        status: "99", 
        message: "Data tidak ditemukan" 
      });
    }
    
    res.status(200).json({ 
      status: "00", 
      message: "Deskripsi Predikat berhasil dihapus" 
    });
  } catch (err) {
    console.error("❌ Error deletePredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};