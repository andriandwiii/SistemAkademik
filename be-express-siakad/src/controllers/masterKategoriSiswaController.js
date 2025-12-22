import * as KategoriModel from "../models/masterKategoriSiswaModel.js";

/**
 * Get all kategori siswa
 */
export const getAllKategori = async (req, res) => {
  try {
    const data = await KategoriModel.getAllKategori();
    
    res.status(200).json({
      status: "00",
      message: "Data kategori siswa berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllKategori:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get kategori by ID
 */
export const getKategoriById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await KategoriModel.getKategoriById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data kategori berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getKategoriById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Create kategori
 */
export const createKategori = async (req, res) => {
  try {
    const { NAMA_KATEGORI, DESKRIPSI, PRIORITAS } = req.body;

    if (!NAMA_KATEGORI) {
      return res.status(400).json({
        status: "99",
        message: "NAMA_KATEGORI wajib diisi"
      });
    }

    const result = await KategoriModel.createKategori({
      NAMA_KATEGORI,
      DESKRIPSI: DESKRIPSI || null,
      PRIORITAS: PRIORITAS || 0,
      STATUS: "Aktif"
    });

    res.status(201).json({
      status: "00",
      message: "Kategori siswa berhasil ditambahkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error createKategori:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Update kategori
 */
export const updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await KategoriModel.updateKategori(id, updateData);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Kategori berhasil diperbarui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error updateKategori:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete kategori (soft delete)
 */
export const deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await KategoriModel.deleteKategori(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Kategori berhasil dinonaktifkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error deleteKategori:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Hard delete kategori
 */
export const hardDeleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await KategoriModel.hardDeleteKategori(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Kategori berhasil dihapus permanen"
    });
  } catch (err) {
    console.error("❌ Error hardDeleteKategori:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};