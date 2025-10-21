import * as MataPelajaranModel from "../models/masterMataPelajaranModel.js";

/** GET semua mata pelajaran */
export const getAllMataPelajaran = async (req, res) => {
  try {
    const data = await MataPelajaranModel.getAllMataPelajaran();
    res.status(200).json({
      status: "success",
      message: "Data mata pelajaran berhasil diambil",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data mata pelajaran",
      error: error.message,
    });
  }
};

/** GET by ID */
export const getMataPelajaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MataPelajaranModel.getMataPelajaranById(id);
    if (!data) {
      return res.status(404).json({ status: "warning", message: "Data tidak ditemukan" });
    }
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** POST tambah */
export const addMataPelajaran = async (req, res) => {
  try {
    const { KODE_MAPEL, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;

    await MataPelajaranModel.addMataPelajaran({
      KODE_MAPEL,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS,
    });

    res.status(201).json({ status: "success", message: "Mata pelajaran berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** PUT update */
export const updateMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { KODE_MAPEL, NAMA_MAPEL, KATEGORI, DESKRIPSI, STATUS } = req.body;

    await MataPelajaranModel.updateMataPelajaran(id, {
      KODE_MAPEL,
      NAMA_MAPEL,
      KATEGORI,
      DESKRIPSI,
      STATUS,
    });

    res.status(200).json({ status: "success", message: "Data berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** DELETE */
export const deleteMataPelajaran = async (req, res) => {
  try {
    const { id } = req.params;
    await MataPelajaranModel.deleteMataPelajaran(id);
    res.status(200).json({ status: "success", message: "Data berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
