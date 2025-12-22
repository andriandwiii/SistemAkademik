import * as KomponenModel from "../models/masterKomponenBiayaModel.js";

/**
 * Get all komponen biaya
 */
export const getAllKomponen = async (req, res) => {
  try {
    const { jenis_biaya } = req.query;
    const data = await KomponenModel.getAllKomponen(jenis_biaya);
    
    res.status(200).json({
      status: "00",
      message: "Data komponen biaya berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get komponen by ID
 */
export const getKomponenById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await KomponenModel.getKomponenById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Komponen tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data komponen berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getKomponenById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Create komponen
 */
export const createKomponen = async (req, res) => {
  try {
    const { 
      NAMA_KOMPONEN, 
      JENIS_BIAYA, 
      DESKRIPSI, 
      WAJIB, 
      URUTAN 
    } = req.body;

    if (!NAMA_KOMPONEN || !JENIS_BIAYA) {
      return res.status(400).json({
        status: "99",
        message: "NAMA_KOMPONEN dan JENIS_BIAYA wajib diisi"
      });
    }

    if (!["RUTIN", "NON_RUTIN"].includes(JENIS_BIAYA)) {
      return res.status(400).json({
        status: "99",
        message: "JENIS_BIAYA harus RUTIN atau NON_RUTIN"
      });
    }

    const result = await KomponenModel.createKomponen({
      NAMA_KOMPONEN,
      JENIS_BIAYA,
      DESKRIPSI: DESKRIPSI || null,
      WAJIB: WAJIB !== undefined ? WAJIB : true,
      STATUS: "Aktif",
      URUTAN: URUTAN || 0
    });

    res.status(201).json({
      status: "00",
      message: "Komponen biaya berhasil ditambahkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error createKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Update komponen
 */
export const updateKomponen = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate JENIS_BIAYA if provided
    if (updateData.JENIS_BIAYA && !["RUTIN", "NON_RUTIN"].includes(updateData.JENIS_BIAYA)) {
      return res.status(400).json({
        status: "99",
        message: "JENIS_BIAYA harus RUTIN atau NON_RUTIN"
      });
    }

    const result = await KomponenModel.updateKomponen(id, updateData);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Komponen tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Komponen berhasil diperbarui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error updateKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete komponen (soft delete)
 */
export const deleteKomponen = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await KomponenModel.deleteKomponen(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Komponen tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Komponen berhasil dinonaktifkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error deleteKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Hard delete komponen
 */
export const hardDeleteKomponen = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await KomponenModel.hardDeleteKomponen(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Komponen tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Komponen berhasil dihapus permanen"
    });
  } catch (err) {
    console.error("❌ Error hardDeleteKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};