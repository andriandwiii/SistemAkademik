import * as OrtuModel from "../models/orangtuaModel.js";

// GET semua ortu berdasarkan SISWA_ID
export const getOrtuBySiswa = async (req, res) => {
  try {
    const siswaId = req.params.siswaId;
    const data = await OrtuModel.getOrtuBySiswaId(siswaId);

    res.status(200).json({
      status: "00",
      message: "Data ortu berhasil diambil",
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data ortu",
      error: err.message,
    });
  }
};

// ADD ortu baru
export const addOrtu = async (req, res) => {
  try {
    const newData = await OrtuModel.addOrtu(req.body);

    res.status(201).json({
      status: "00",
      message: "Ortu berhasil ditambahkan",
      data: newData,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan ortu",
      error: err.message,
    });
  }
};

// UPDATE ortu
export const updateOrtu = async (req, res) => {
  try {
    const updated = await OrtuModel.updateOrtu(req.params.id, req.body);

    if (!updated)
      return res.status(404).json({
        status: "04",
        message: "Ortu tidak ditemukan",
      });

    res.status(200).json({
      status: "00",
      message: "Ortu berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui ortu",
      error: err.message,
    });
  }
};

// DELETE ortu
export const deleteOrtu = async (req, res) => {
  try {
    const deleted = await OrtuModel.deleteOrtu(req.params.id);

    if (!deleted)
      return res.status(404).json({
        status: "04",
        message: "Ortu tidak ditemukan",
      });

    res.status(200).json({
      status: "00",
      message: "Ortu berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus ortu",
      error: err.message,
    });
  }
};
