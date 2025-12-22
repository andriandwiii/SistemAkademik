import * as DispensasiModel from "../models/dispensasiModel.js";

/**
 * Get all dispensasi
 */
export const getAllDispensasi = async (req, res) => {
  try {
    const { nis, status, jenis } = req.query;

    const filters = {};
    if (nis) filters.nis = nis;
    if (status) filters.status = status;
    if (jenis) filters.jenis = jenis;

    const data = await DispensasiModel.getAllDispensasi(filters);

    res.status(200).json({
      status: "00",
      message: "Data dispensasi berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllDispensasi:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get dispensasi by ID
 */
export const getDispensasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await DispensasiModel.getDispensasiById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Dispensasi tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data dispensasi berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getDispensasiById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Create dispensasi
 */
export const createDispensasi = async (req, res) => {
  try {
    const {
      NIS,
      TAGIHAN_ID,
      JENIS,
      NILAI_POTONGAN,
      PERSEN_POTONGAN,
      JUMLAH_CICILAN,
      ALASAN,
      DOKUMEN_PENDUKUNG
    } = req.body;

    if (!NIS || !TAGIHAN_ID || !JENIS || !ALASAN) {
      return res.status(400).json({
        status: "99",
        message: "NIS, TAGIHAN_ID, JENIS, dan ALASAN wajib diisi"
      });
    }

    const validJenis = ["POTONGAN_TETAP", "POTONGAN_PERSEN", "CICILAN", "PEMBEBASAN"];
    if (!validJenis.includes(JENIS)) {
      return res.status(400).json({
        status: "99",
        message: `JENIS harus salah satu dari: ${validJenis.join(", ")}`
      });
    }

    const result = await DispensasiModel.createDispensasi({
      NIS,
      TAGIHAN_ID,
      JENIS,
      NILAI_POTONGAN: NILAI_POTONGAN || 0,
      PERSEN_POTONGAN: PERSEN_POTONGAN || 0,
      JUMLAH_CICILAN: JUMLAH_CICILAN || 0,
      ALASAN,
      DOKUMEN_PENDUKUNG: DOKUMEN_PENDUKUNG || null,
      STATUS: "DIAJUKAN"
    });

    res.status(201).json({
      status: "00",
      message: "Pengajuan dispensasi berhasil dibuat",
      data: result
    });
  } catch (err) {
    console.error("❌ Error createDispensasi:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Update dispensasi
 */
export const updateDispensasi = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Only allow update if status is DIAJUKAN
    const current = await DispensasiModel.getDispensasiById(id);
    if (!current) {
      return res.status(404).json({
        status: "01",
        message: "Dispensasi tidak ditemukan"
      });
    }

    if (current.STATUS !== "DIAJUKAN") {
      return res.status(400).json({
        status: "99",
        message: "Hanya dispensasi dengan status DIAJUKAN yang dapat diubah"
      });
    }

    const result = await DispensasiModel.updateDispensasi(id, updateData);

    res.status(200).json({
      status: "00",
      message: "Dispensasi berhasil diperbarui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error updateDispensasi:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Approve dispensasi
 */
export const approveDispensasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_approval } = req.body;
    const userId = req.user?.userId || "SYSTEM";

    const result = await DispensasiModel.approveDispensasi(
      id, 
      userId, 
      catatan_approval
    );

    res.status(200).json({
      status: "00",
      message: "Dispensasi berhasil disetujui",
      data: result
    });
  } catch (err) {
    console.error("❌ Error approveDispensasi:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Reject dispensasi
 */
export const rejectDispensasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_approval } = req.body;
    const userId = req.user?.userId || "SYSTEM";

    const result = await DispensasiModel.rejectDispensasi(
      id, 
      userId, 
      catatan_approval
    );

    res.status(200).json({
      status: "00",
      message: "Dispensasi ditolak",
      data: result
    });
  } catch (err) {
    console.error("❌ Error rejectDispensasi:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete dispensasi
 */
export const deleteDispensasi = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DispensasiModel.deleteDispensasi(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Dispensasi tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Dispensasi berhasil dihapus"
    });
  } catch (err) {
    console.error("❌ Error deleteDispensasi:", err);
    
    if (err.message.includes("disetujui")) {
      return res.status(400).json({
        status: "99",
        message: err.message
      });
    }
    
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};