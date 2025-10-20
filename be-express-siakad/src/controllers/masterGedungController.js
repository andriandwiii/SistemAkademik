import * as MasterGedungModel from "../models/masterGedungModel.js";

/**
 * GET semua gedung
 */
export const getAllGedung = async (req, res) => {
  try {
    const gedung = await MasterGedungModel.getAllGedung();

    if (!gedung || gedung.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data gedung",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data gedung berhasil diambil",
      data: gedung,
    });
  } catch (err) {
    res.status(500).json({
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

    res.status(200).json({
      status: "00",
      message: "Data gedung berhasil diambil",
      data: gedung,
    });
  } catch (err) {
    res.status(500).json({
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
    const { KODE_GEDUNG, NAMA_GEDUNG } = req.body;

    if (!KODE_GEDUNG || !NAMA_GEDUNG) {
      return res.status(400).json({
        status: "01",
        message: "KODE_GEDUNG dan NAMA_GEDUNG wajib diisi",
      });
    }

    const existing = await MasterGedungModel.getGedungByKode(KODE_GEDUNG);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: "KODE_GEDUNG sudah terdaftar",
      });
    }

    const newGedung = await MasterGedungModel.createGedung(req.body);

    res.status(201).json({
      status: "00",
      message: "Gedung berhasil ditambahkan",
      data: newGedung,
    });
  } catch (err) {
    res.status(500).json({
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
    const existing = await MasterGedungModel.getGedungById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Gedung tidak ditemukan untuk diperbarui",
      });
    }

    const updated = await MasterGedungModel.updateGedung(id, req.body);

    res.status(200).json({
      status: "00",
      message: "Gedung berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
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

    res.status(200).json({
      status: "00",
      message: "Gedung berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus gedung",
      error: err.message,
    });
  }
};
