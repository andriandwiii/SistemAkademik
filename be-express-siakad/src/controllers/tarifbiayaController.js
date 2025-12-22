import * as TarifModel from "../models/tarifbiayaModel.js";

/**
 * Get all tarif
 */
export const getAllTarif = async (req, res) => {
  try {
    const { tahun_ajaran_id, kategori_id, tingkatan_id, komponen_id } = req.query;
    
    const filters = {};
    if (tahun_ajaran_id) filters.tahunAjaranId = tahun_ajaran_id;
    if (kategori_id) filters.kategoriId = kategori_id;
    if (tingkatan_id) filters.tingkatanId = tingkatan_id;
    if (komponen_id) filters.komponenId = komponen_id;

    const data = await TarifModel.getAllTarif(filters);
    
    res.status(200).json({
      status: "00",
      message: "Data tarif biaya berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllTarif:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get tarif by ID
 */
export const getTarifById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await TarifModel.getTarifById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Tarif tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data tarif berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getTarifById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Create tarif
 */
export const createTarif = async (req, res) => {
  try {
    const { 
      KOMPONEN_ID, 
      KATEGORI_ID, 
      TAHUN_AJARAN_ID, 
      TINGKATAN_ID,
      NOMINAL 
    } = req.body;

    if (!KOMPONEN_ID || !KATEGORI_ID || !TAHUN_AJARAN_ID || !NOMINAL) {
      return res.status(400).json({
        status: "99",
        message: "KOMPONEN_ID, KATEGORI_ID, TAHUN_AJARAN_ID, dan NOMINAL wajib diisi"
      });
    }

    if (NOMINAL <= 0) {
      return res.status(400).json({
        status: "99",
        message: "NOMINAL harus lebih besar dari 0"
      });
    }

    const result = await TarifModel.createTarif({
      KOMPONEN_ID,
      KATEGORI_ID,
      TAHUN_AJARAN_ID,
      TINGKATAN_ID: TINGKATAN_ID || null,
      NOMINAL,
      STATUS: "Aktif"
    });

    res.status(201).json({
      status: "00",
      message: "Tarif biaya berhasil ditambahkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error createTarif:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: "99",
        message: "Tarif untuk kombinasi ini sudah ada"
      });
    }
    
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Update tarif
 */
export const updateTarif = async (req, res) => {
  try {
    const { id } = req.params;
    const { NOMINAL, STATUS } = req.body;

    if (NOMINAL !== undefined && NOMINAL <= 0) {
      return res.status(400).json({
        status: "99",
        message: "NOMINAL harus lebih besar dari 0"
      });
    }

    const updateData = {};
    if (NOMINAL !== undefined) updateData.NOMINAL = NOMINAL;
    if (STATUS !== undefined) updateData.STATUS = STATUS;

    const result = await TarifModel.updateTarif(id, updateData);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Tarif tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Tarif berhasil diperbarui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error updateTarif:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete tarif (soft delete)
 */
export const deleteTarif = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TarifModel.deleteTarif(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Tarif tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Tarif berhasil dinonaktifkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error deleteTarif:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Hard delete tarif
 */
export const hardDeleteTarif = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TarifModel.hardDeleteTarif(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Tarif tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Tarif berhasil dihapus permanen"
    });
  } catch (err) {
    console.error("❌ Error hardDeleteTarif:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};