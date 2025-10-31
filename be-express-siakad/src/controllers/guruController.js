import * as GuruModel from "../models/guruModel.js";

// 🔹 Ambil semua guru
export const getAllGuru = async (req, res) => {
  try {
    const data = await GuruModel.getAllGuruWithUser();
    res.json({ status: "00", message: "Data guru ditemukan", data });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};

// 🔹 Ambil guru by ID
export const getGuruById = async (req, res) => {
  try {
    const data = await GuruModel.getGuruByIdWithUser(req.params.id);
    if (!data) {
      return res.status(404).json({ status: "01", message: "Guru tidak ditemukan" });
    }
    res.json({ status: "00", message: "Data guru ditemukan", data });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};

// 🔹 Tambah guru
export const createGuru = async (req, res) => {
  try {
    // Sekarang KEAHLIAN otomatis ikut dibaca dari req.body
    const guru = await GuruModel.addGuru(req.body);
    res.json({ status: "00", message: "Guru berhasil ditambahkan", guru });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};

// 🔹 Update guru
export const updateGuru = async (req, res) => {
  try {
    const guru = await GuruModel.updateGuru(req.params.id, req.body);
    res.json({ status: "00", message: "Guru berhasil diperbarui", guru });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};

// 🔹 Hapus guru
export const deleteGuru = async (req, res) => {
  try {
    await GuruModel.deleteGuru(req.params.id);
    res.json({ status: "00", message: "Guru berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};
