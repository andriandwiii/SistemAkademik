import * as MasterJabatanModel from "../models/masterJabatanModel.js";

/**
 * GET semua jabatan
 */
export const getAllJabatan = async (req, res) => {
  try {
    const jabatan = await MasterJabatanModel.getAllJabatan();

    if (!jabatan || jabatan.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data jabatan",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jabatan berhasil diambil",
      data: jabatan.map((j) => ({
        id: j.id,
        KODE_JABATAN: j.KODE_JABATAN,
        NAMA_JABATAN: j.NAMA_JABATAN,
        STATUS: j.STATUS,
        created_at: j.created_at,
        updated_at: j.updated_at,
      })),
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jabatan",
      error: err.message,
    });
  }
};

/**
 * GET jabatan by ID
 */
export const getJabatanById = async (req, res) => {
  try {
    const { id } = req.params;
    const jabatan = await MasterJabatanModel.getJabatanById(id);

    if (!jabatan) {
      return res.status(404).json({
        status: "04",
        message: "Jabatan tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jabatan berhasil diambil",
      data: {
        id: jabatan.id,
        KODE_JABATAN: jabatan.KODE_JABATAN,
        NAMA_JABATAN: jabatan.NAMA_JABATAN,
        STATUS: jabatan.STATUS,
        created_at: jabatan.created_at,
        updated_at: jabatan.updated_at,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jabatan",
      error: err.message,
    });
  }
};

/**
 * CREATE jabatan baru
 */
export const createJabatan = async (req, res) => {
  try {
    const { KODE_JABATAN, NAMA_JABATAN, STATUS } = req.body;

    if (!KODE_JABATAN || !NAMA_JABATAN) {
      return res.status(400).json({
        status: "01",
        message: "KODE_JABATAN dan NAMA_JABATAN wajib diisi",
      });
    }

    // Cek duplikat
    const existing = await MasterJabatanModel.getJabatanByKode(KODE_JABATAN);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: "KODE_JABATAN sudah terdaftar",
      });
    }

    const newJabatan = await MasterJabatanModel.createJabatan({
      KODE_JABATAN,
      NAMA_JABATAN,
      STATUS,
    });

    res.status(201).json({
      status: "00",
      message: "Jabatan berhasil ditambahkan",
      data: newJabatan,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan jabatan",
      error: err.message,
    });
  }
};

/**
 * UPDATE jabatan
 */
export const updateJabatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { KODE_JABATAN, NAMA_JABATAN, STATUS } = req.body;

    if (!KODE_JABATAN || !NAMA_JABATAN) {
      return res.status(400).json({
        status: "01",
        message: "KODE_JABATAN dan NAMA_JABATAN wajib diisi",
      });
    }

    const existing = await MasterJabatanModel.getJabatanById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jabatan tidak ditemukan untuk diperbarui",
      });
    }

    const updated = await MasterJabatanModel.updateJabatan(id, {
      KODE_JABATAN,
      NAMA_JABATAN,
      STATUS,
    });

    res.status(200).json({
      status: "00",
      message: "Jabatan berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui jabatan",
      error: err.message,
    });
  }
};

/**
 * DELETE jabatan
 */
export const deleteJabatan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterJabatanModel.getJabatanById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jabatan tidak ditemukan untuk dihapus",
      });
    }

    await MasterJabatanModel.deleteJabatan(id);

    res.status(200).json({
      status: "00",
      message: "Jabatan berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus jabatan",
      error: err.message,
    });
  }
};
