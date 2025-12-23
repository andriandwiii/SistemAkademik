import * as MasterInfoSekolahModel from "../models/masterInfoSekolahModel.js";

export const getAllInfoSekolah = async (req, res) => {
  try {
    const data = await MasterInfoSekolahModel.getAllInfoSekolah();
    res.status(200).json({
      status: "00",
      message: "Data info sekolah berhasil diambil",
      data: data
    });
  } catch (err) {
    res.status(500).json({ status: "99", message: "Gagal mengambil data", error: err.message });
  }
};

export const getInfoSekolahById = async (req, res) => {
  try {
    const data = await MasterInfoSekolahModel.getInfoSekolahById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const createInfoSekolah = async (req, res) => {
  try {
    const { JUDUL, DESKRIPSI, KATEGORI, TANGGAL } = req.body;
    if (!JUDUL || !DESKRIPSI || !KATEGORI || !TANGGAL) {
      return res.status(400).json({ status: "01", message: "Field tidak lengkap" });
    }
    const newInfo = await MasterInfoSekolahModel.createInfoSekolah(req.body);
    res.status(201).json({ status: "00", message: "Berhasil tambah info", data: newInfo });
  } catch (err) {
    res.status(500).json({ status: "99", message: "Terjadi kesalahan saat menambahkan informasi", error: err.message });
  }
};

export const updateInfoSekolah = async (req, res) => {
  try {
    const updated = await MasterInfoSekolahModel.updateInfoSekolah(req.params.id, req.body);
    res.status(200).json({ status: "00", message: "Berhasil update info", data: updated });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteInfoSekolah = async (req, res) => {
  try {
    await MasterInfoSekolahModel.deleteInfoSekolah(req.params.id);
    res.status(200).json({ status: "00", message: "Info berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};