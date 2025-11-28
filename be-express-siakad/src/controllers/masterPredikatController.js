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

/** 🔹 Tambah Predikat (SIMPLIFIED - Hanya per Tahun Ajaran atau Tahun + Tingkatan) */
export const createPredikat = async (req, res) => {
  try {
    const {
      TAHUN_AJARAN_ID,
      TINGKATAN_ID, // Nullable - Jika NULL berarti berlaku untuk semua tingkatan
      DESKRIPSI_A, 
      DESKRIPSI_B, 
      DESKRIPSI_C, 
      DESKRIPSI_D
    } = req.body;

    // 1. Validasi Input Dasar
    if (!TAHUN_AJARAN_ID) {
      return res.status(400).json({
        status: "99",
        message: "Field TAHUN_AJARAN_ID wajib diisi",
      });
    }

    // 2. ✅ CEK DUPLIKAT: Hanya 1 predikat per (tahun + tingkatan)
    const existing = await PredikatModel.checkDuplicate(
      TAHUN_AJARAN_ID, 
      TINGKATAN_ID || null
    );

    if (existing) {
      let msg = `Predikat untuk tahun ajaran ${TAHUN_AJARAN_ID}`;
      if (TINGKATAN_ID) {
        msg += ` tingkatan ${TINGKATAN_ID}`;
      } else {
        msg += ` (global)`;
      }
      msg += ` sudah ada`;

      return res.status(409).json({
        status: "99",
        message: msg,
      });
    }

    // 3. Simpan Data
    const result = await PredikatModel.createPredikat({
      TAHUN_AJARAN_ID,
      TINGKATAN_ID: TINGKATAN_ID || null,
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

    // Jika ada perubahan tahun/tingkatan, cek duplikat
    if (dataUpdate.TAHUN_AJARAN_ID || dataUpdate.TINGKATAN_ID !== undefined) {
      const tahun = dataUpdate.TAHUN_AJARAN_ID || oldData.tahun_ajaran.TAHUN_AJARAN_ID;
      const tingkat = (dataUpdate.TINGKATAN_ID !== undefined) 
        ? dataUpdate.TINGKATAN_ID 
        : oldData.TINGKATAN_ID;

      const duplicate = await PredikatModel.checkDuplicateExcept(
        tahun, 
        tingkat, 
        id
      );

      if (duplicate) {
        return res.status(409).json({
          status: "99",
          message: "Predikat untuk tahun ajaran dan tingkatan ini sudah ada",
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