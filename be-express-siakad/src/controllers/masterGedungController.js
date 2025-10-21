import * as MasterGedungModel from "../models/masterGedungModel.js";

/**
 * GET semua gedung
 */
export const getAllGedung = async (req, res) => {
  try {
    const gedung = await MasterGedungModel.getAllGedung();

    return res.status(200).json({
      status: "00",
      message: gedung.length > 0 ? "Data gedung berhasil diambil" : "Belum ada data gedung",
      data: gedung.map((item) => ({
        id: item.id,
        GEDUNG_ID: item.GEDUNG_ID,
        NAMA_GEDUNG: item.NAMA_GEDUNG,
        LOKASI: item.LOKASI,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data gedung",
      error: err.message,
    });
  }
};

/**
 * GET gedung by ID
 */
export const getGedungById = async (req, res) => {
  try {
    const { id } = req.params;
    const gedung = await MasterGedungModel.getGedungById(id);

    if (!gedung) {
      return res.status(404).json({
        status: "04",
        message: "Gedung tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Data gedung berhasil diambil",
      data: gedung,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data gedung",
      error: err.message,
    });
  }
};

/**
 * CREATE gedung baru
 */
export const createGedung = async (req, res) => {
  try {
    let { GEDUNG_ID, NAMA_GEDUNG, LOKASI } = req.body;

    if (!NAMA_GEDUNG) {
      return res.status(400).json({
        status: "01",
        message: "NAMA_GEDUNG wajib diisi",
      });
    }

    // Auto-generate GEDUNG_ID jika tidak dikirim
    if (!GEDUNG_ID) {
      const lastGedung = await MasterGedungModel.getLastGedung();
      const nextNumber = lastGedung
        ? parseInt(lastGedung.GEDUNG_ID.replace("G", "")) + 1
        : 1;
      GEDUNG_ID = "G" + nextNumber.toString().padStart(4, "0");
    }

    // Cek duplikat GEDUNG_ID
    const existing = await MasterGedungModel.getGedungByKode(GEDUNG_ID);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: `GEDUNG_ID ${GEDUNG_ID} sudah terdaftar`,
      });
    }

    const newGedung = await MasterGedungModel.createGedung({
      GEDUNG_ID,
      NAMA_GEDUNG,
      LOKASI,
    });

    return res.status(201).json({
      status: "00",
      message: "Gedung berhasil ditambahkan",
      data: newGedung,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan gedung",
      error: err.message,
    });
  }
};

/**
 * UPDATE gedung
 */
export const updateGedung = async (req, res) => {
  try {
    const { id } = req.params;
    const { NAMA_GEDUNG, LOKASI } = req.body;

    if (!NAMA_GEDUNG) {
      return res.status(400).json({
        status: "01",
        message: "NAMA_GEDUNG wajib diisi",
      });
    }

    const existing = await MasterGedungModel.getGedungById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Gedung tidak ditemukan untuk diperbarui",
      });
    }

    const updatedGedung = await MasterGedungModel.updateGedung(id, {
      NAMA_GEDUNG,
      LOKASI,
    });

    return res.status(200).json({
      status: "00",
      message: "Gedung berhasil diperbarui",
      data: updatedGedung,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui gedung",
      error: err.message,
    });
  }
};

/**
 * DELETE gedung
 */
export const deleteGedung = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterGedungModel.getGedungById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Gedung tidak ditemukan untuk dihapus",
      });
    }

    await MasterGedungModel.deleteGedung(id);

    return res.status(200).json({
      status: "00",
      message: "Gedung berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus gedung",
      error: err.message,
    });
  }
};
