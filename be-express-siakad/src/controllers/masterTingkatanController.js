import * as MasterTingkatanModel from "../models/masterTingkatanModel.js";

/**
 * GET semua tingkatan
 */
export const getAllTingkatan = async (req, res) => {
  try {
    const tingkatan = await MasterTingkatanModel.getAllTingkatan();

    return res.status(200).json({
      status: "00",
      message: tingkatan.length > 0 ? "Data tingkatan berhasil diambil" : "Belum ada data tingkatan",
      data: tingkatan.map((item) => ({
        id: item.id,
        TINGKATAN_ID: item.TINGKATAN_ID,
        TINGKATAN: item.TINGKATAN,
        STATUS: item.STATUS,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data tingkatan",
      error: err.message,
    });
  }
};

/**
 * GET tingkatan by ID
 */
export const getTingkatanById = async (req, res) => {
  try {
    const { id } = req.params;
    const tingkatan = await MasterTingkatanModel.getTingkatanById(id);

    if (!tingkatan) {
      return res.status(404).json({
        status: "04",
        message: "Tingkatan tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Data tingkatan berhasil diambil",
      data: tingkatan,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data tingkatan",
      error: err.message,
    });
  }
};

/**
 * CREATE tingkatan baru
 */
export const createTingkatan = async (req, res) => {
  try {
    let { TINGKATAN_ID, TINGKATAN, STATUS } = req.body;

    if (!TINGKATAN) {
      return res.status(400).json({
        status: "01",
        message: "TINGKATAN wajib diisi",
      });
    }

    // Auto-generate TINGKATAN_ID jika tidak dikirim
    if (!TINGKATAN_ID) {
      const lastTingkatan = await MasterTingkatanModel.getLastTingkatan();
      const nextNumber = lastTingkatan
        ? parseInt(lastTingkatan.TINGKATAN_ID.replace("T", "")) + 1
        : 1;
      TINGKATAN_ID = "T" + nextNumber.toString().padStart(4, "0");
    }

    // Cek duplikat TINGKATAN_ID
    const existing = await MasterTingkatanModel.getTingkatanByKode(TINGKATAN_ID);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: `TINGKATAN_ID ${TINGKATAN_ID} sudah terdaftar`,
      });
    }

    const newTingkatan = await MasterTingkatanModel.createTingkatan({
      TINGKATAN_ID,
      TINGKATAN,
      STATUS,
    });

    return res.status(201).json({
      status: "00",
      message: "Tingkatan berhasil ditambahkan",
      data: newTingkatan,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan tingkatan",
      error: err.message,
    });
  }
};

/**
 * UPDATE tingkatan
 */
export const updateTingkatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { TINGKATAN_ID, TINGKATAN, STATUS } = req.body;

    if (!TINGKATAN) {
      return res.status(400).json({
        status: "01",
        message: "TINGKATAN wajib diisi",
      });
    }

    const existing = await MasterTingkatanModel.getTingkatanById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Tingkatan tidak ditemukan untuk diperbarui",
      });
    }

    const updatedTingkatan = await MasterTingkatanModel.updateTingkatan(id, {
      TINGKATAN_ID,
      TINGKATAN,
      STATUS,
    });

    return res.status(200).json({
      status: "00",
      message: "Tingkatan berhasil diperbarui",
      data: updatedTingkatan,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui tingkatan",
      error: err.message,
    });
  }
};

/**
 * DELETE tingkatan
 */
export const deleteTingkatan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterTingkatanModel.getTingkatanById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Tingkatan tidak ditemukan untuk dihapus",
      });
    }

    await MasterTingkatanModel.deleteTingkatan(id);

    return res.status(200).json({
      status: "00",
      message: "Tingkatan berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus tingkatan",
      error: err.message,
    });
  }
};
