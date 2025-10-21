import * as MasterRuangModel from "../models/masterRuangKelasModel.js";

/**
 * GET semua ruang
 */
export const getAllRuang = async (req, res) => {
  try {
    const ruang = await MasterRuangModel.getAllRuang();

    if (!ruang || ruang.length === 0) {
      return res.status(200).json({
        status: "00",
        message: "Belum ada data ruang",
        data: [],
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data ruang berhasil diambil",
      data: ruang.map((r) => ({
        id: r.id,
        RUANG_ID: r.RUANG_ID,
        NAMA_RUANG: r.NAMA_RUANG,
        DESKRIPSI: r.DESKRIPSI,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data ruang",
      error: err.message,
    });
  }
};

/**
 * GET ruang by ID
 */
export const getRuangById = async (req, res) => {
  try {
    const { id } = req.params;
    const ruang = await MasterRuangModel.getRuangById(id);

    if (!ruang) {
      return res.status(404).json({
        status: "04",
        message: "Ruang tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data ruang berhasil diambil",
      data: ruang,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data ruang",
      error: err.message,
    });
  }
};

/**
 * CREATE ruang baru
 */
export const createRuang = async (req, res) => {
  try {
    const { RUANG_ID, NAMA_RUANG, DESKRIPSI } = req.body;

    if (!RUANG_ID || !NAMA_RUANG) {
      return res.status(400).json({
        status: "01",
        message: "RUANG_ID dan NAMA_RUANG wajib diisi",
      });
    }

    // Cek apakah RUANG_ID sudah ada
    const existing = await MasterRuangModel.getRuangByKode(RUANG_ID);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: `RUANG_ID ${RUANG_ID} sudah terdaftar`,
      });
    }

    const newRuang = await MasterRuangModel.createRuang({
      RUANG_ID,
      NAMA_RUANG,
      DESKRIPSI,
    });

    res.status(201).json({
      status: "00",
      message: "Ruang berhasil ditambahkan",
      data: newRuang,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan ruang",
      error: err.message,
    });
  }
};

/**
 * UPDATE ruang
 */
export const updateRuang = async (req, res) => {
  try {
    const { id } = req.params;
    const { RUANG_ID, NAMA_RUANG, DESKRIPSI } = req.body;

    if (!NAMA_RUANG) {
      return res.status(400).json({
        status: "01",
        message: "NAMA_RUANG wajib diisi",
      });
    }

    const existing = await MasterRuangModel.getRuangById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Ruang tidak ditemukan untuk diperbarui",
      });
    }

    const updatedRuang = await MasterRuangModel.updateRuang(id, {
      RUANG_ID,
      NAMA_RUANG,
      DESKRIPSI,
    });

    res.status(200).json({
      status: "00",
      message: "Ruang berhasil diperbarui",
      data: updatedRuang,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui ruang",
      error: err.message,
    });
  }
};

/**
 * DELETE ruang
 */
export const deleteRuang = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterRuangModel.getRuangById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Ruang tidak ditemukan untuk dihapus",
      });
    }

    await MasterRuangModel.deleteRuang(id);

    res.status(200).json({
      status: "00",
      message: "Ruang berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus ruang",
      error: err.message,
    });
  }
};
