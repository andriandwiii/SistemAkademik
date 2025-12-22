import * as TagihanModel from "../models/tagihansiswaModel.js";

/**
 * Get all tagihan
 */
export const getAllTagihan = async (req, res) => {
  try {
    const { nis, status, tahun_ajaran_id, bulan } = req.query;
    
    const filters = {};
    if (nis) filters.nis = nis;
    if (status) filters.status = status;
    if (tahun_ajaran_id) filters.tahunAjaranId = tahun_ajaran_id;
    if (bulan) filters.bulan = parseInt(bulan);

    const data = await TagihanModel.getAllTagihan(filters);
    
    res.status(200).json({
      status: "00",
      message: "Data tagihan berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllTagihan:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get tagihan by NIS
 */
export const getTagihanByNIS = async (req, res) => {
  try {
    const { nis } = req.params;
    const { tahun_ajaran_id } = req.query;

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id wajib diisi"
      });
    }

    const data = await TagihanModel.getTagihanByNIS(nis, tahun_ajaran_id);
    const summary = await TagihanModel.getTagihanSummary(nis, tahun_ajaran_id);
    
    res.status(200).json({
      status: "00",
      message: "Data tagihan siswa berhasil diambil",
      summary,
      data
    });
  } catch (err) {
    console.error("❌ Error getTagihanByNIS:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get tagihan by ID
 */
export const getTagihanById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await TagihanModel.getTagihanById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Tagihan tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data tagihan berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getTagihanById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Create tagihan
 */
export const createTagihan = async (req, res) => {
  try {
    const {
      NIS,
      KOMPONEN_ID,
      TAHUN_AJARAN_ID,
      BULAN,
      TAHUN,
      NOMINAL,
      POTONGAN,
      TGL_JATUH_TEMPO,
      KETERANGAN
    } = req.body;

    if (!NIS || !KOMPONEN_ID || !TAHUN_AJARAN_ID || !NOMINAL) {
      return res.status(400).json({
        status: "99",
        message: "NIS, KOMPONEN_ID, TAHUN_AJARAN_ID, dan NOMINAL wajib diisi"
      });
    }

    const result = await TagihanModel.createTagihan({
      NIS,
      KOMPONEN_ID,
      TAHUN_AJARAN_ID,
      BULAN: BULAN || null,
      TAHUN: TAHUN || new Date().getFullYear(),
      NOMINAL,
      POTONGAN: POTONGAN || 0,
      TGL_JATUH_TEMPO: TGL_JATUH_TEMPO || null,
      KETERANGAN: KETERANGAN || null,
      STATUS: "BELUM_BAYAR"
    });

    res.status(201).json({
      status: "00",
      message: "Tagihan berhasil ditambahkan",
      data: result
    });
  } catch (err) {
    console.error("❌ Error createTagihan:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Generate SPP Massal
 */
export const generateSPPMassal = async (req, res) => {
  try {
    const { tahun_ajaran_id, bulan, tahun, komponen_id } = req.body;

    if (!tahun_ajaran_id || !bulan || !tahun) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id, bulan, dan tahun wajib diisi"
      });
    }

    if (bulan < 1 || bulan > 12) {
      return res.status(400).json({
        status: "99",
        message: "Bulan harus antara 1-12"
      });
    }

    console.log(`📋 Generating SPP untuk bulan ${bulan}/${tahun}...`);
    
    const results = await TagihanModel.generateSPPMassal(
      tahun_ajaran_id, 
      bulan, 
      tahun, 
      komponen_id || "KOMP001"
    );

    const summary = {
      total_processed: results.length,
      berhasil: results.filter(r => r.status === "berhasil").length,
      sudah_ada: results.filter(r => r.status === "sudah_ada").length,
      gagal: results.filter(r => r.status === "tarif_tidak_ada").length,
    };

    res.status(200).json({
      status: "00",
      message: "Generate SPP massal selesai",
      summary,
      details: results
    });
  } catch (err) {
    console.error("❌ Error generateSPPMassal:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Update tagihan
 */
export const updateTagihan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await TagihanModel.updateTagihan(id, updateData);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Tagihan tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Tagihan berhasil diperbarui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error updateTagihan:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete tagihan
 */
export const deleteTagihan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TagihanModel.deleteTagihan(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Tagihan tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Tagihan berhasil dihapus"
    });
  } catch (err) {
    console.error("❌ Error deleteTagihan:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};