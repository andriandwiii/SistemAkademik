import * as MasterJurusanModel from "../models/masterJurusanModel.js";

/**
 * GET semua jurusan
 */
export const getAllJurusan = async (req, res) => {
  try {
    const jurusan = await MasterJurusanModel.getAllJurusan();

    if (!jurusan || jurusan.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data jurusan",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jurusan berhasil diambil",
      data: jurusan.map(jurusan => ({
        id: jurusan.id,
        JURUSAN_ID: jurusan.JURUSAN_ID,
        NAMA_JURUSAN: jurusan.NAMA_JURUSAN,
        DESKRIPSI: jurusan.DESKRIPSI,
        created_at: jurusan.created_at,
        updated_at: jurusan.updated_at
      })),
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jurusan",
      error: err.message,
    });
  }
};

/**
 * GET jurusan by JURUSAN_ID
 */
export const getJurusanById = async (req, res) => {
  try {
    const { id } = req.params;
    const jurusan = await MasterJurusanModel.getJurusanById(id);

    if (!jurusan) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data jurusan berhasil diambil",
      data: {
        id: jurusan.id,
        JURUSAN_ID: jurusan.JURUSAN_ID,
        NAMA_JURUSAN: jurusan.NAMA_JURUSAN,
        DESKRIPSI: jurusan.DESKRIPSI,
        created_at: jurusan.created_at,
        updated_at: jurusan.updated_at
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data jurusan",
      error: err.message,
    });
  }
};

/**
 * CREATE jurusan baru
 */
export const createJurusan = async (req, res) => {
  try {
    const { JURUSAN_ID, NAMA_JURUSAN, DESKRIPSI } = req.body;

    if (!JURUSAN_ID || !NAMA_JURUSAN) {
      return res.status(400).json({
        status: "01",
        message: "JURUSAN_ID dan NAMA_JURUSAN wajib diisi",
      });
    }

    // Cek apakah kode jurusan sudah ada
    const existing = await MasterJurusanModel.getJurusanByKode(JURUSAN_ID);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: "JURUSAN_ID sudah terdaftar",
      });
    }

    const newJurusan = await MasterJurusanModel.createJurusan({
      JURUSAN_ID,
      NAMA_JURUSAN,
      DESKRIPSI,
    });

    res.status(201).json({
      status: "00",
      message: "Jurusan berhasil ditambahkan",
      data: {
        id: newJurusan.id,
        JURUSAN_ID: newJurusan.JURUSAN_ID,
        NAMA_JURUSAN: newJurusan.NAMA_JURUSAN,
        DESKRIPSI: newJurusan.DESKRIPSI,
        created_at: newJurusan.created_at,
        updated_at: newJurusan.updated_at
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan jurusan",
      error: err.message,
    });
  }
};

/**
 * UPDATE jurusan
 */
export const updateJurusan = async (req, res) => {
  try {
    const { id } = req.params;
    const { JURUSAN_ID, NAMA_JURUSAN, DESKRIPSI } = req.body;

    if (!JURUSAN_ID || !NAMA_JURUSAN) {
      return res.status(400).json({
        status: "01",
        message: "JURUSAN_ID dan NAMA_JURUSAN wajib diisi",
      });
    }

    const existing = await MasterJurusanModel.getJurusanById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan untuk diperbarui",
      });
    }

    const updatedJurusan = await MasterJurusanModel.updateJurusan(id, {
      JURUSAN_ID,
      NAMA_JURUSAN,
      DESKRIPSI,
    });

    res.status(200).json({
      status: "00",
      message: "Jurusan berhasil diperbarui",
      data: {
        id: updatedJurusan.id,
        JURUSAN_ID: updatedJurusan.JURUSAN_ID,
        NAMA_JURUSAN: updatedJurusan.NAMA_JURUSAN,
        DESKRIPSI: updatedJurusan.DESKRIPSI,
        created_at: updatedJurusan.created_at,
        updated_at: updatedJurusan.updated_at
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui jurusan",
      error: err.message,
    });
  }
};

/**
 * DELETE jurusan
 */
export const deleteJurusan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterJurusanModel.getJurusanById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Jurusan tidak ditemukan untuk dihapus",
      });
    }

    await MasterJurusanModel.deleteJurusan(id);

    res.status(200).json({
      status: "00",
      message: "Jurusan berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus jurusan",
      error: err.message,
    });
  }
};
