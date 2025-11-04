import * as GuruModel from "../models/guruModel.js";

// 🔹 Ambil semua guru ATAU filter by email
export const getAllGuru = async (req, res) => {
  try {
    const { email } = req.query;

    // Jika ada parameter email, filter berdasarkan email
    if (email) {
      const guru = await GuruModel.getGuruByEmail(email);

      if (guru.length === 0) {
        return res.status(404).json({ 
          status: "01", 
          message: "Guru tidak ditemukan",
          data: []
        });
      }

      return res.json({ 
        status: "00", 
        message: "Data guru ditemukan", 
        data: guru 
      });
    }

    // Jika tidak ada filter, ambil semua guru
    const data = await GuruModel.getAllGuruWithUser();
    res.json({ 
      status: "00", 
      message: "Data guru ditemukan", 
      data 
    });
  } catch (err) {
    console.error("Error getAllGuru:", err);
    res.status(500).json({ 
      status: "01", 
      message: err.message 
    });
  }
};

// 🔹 Ambil guru by ID
export const getGuruById = async (req, res) => {
  try {
    const data = await GuruModel.getGuruByIdWithUser(req.params.id);
    if (!data) {
      return res.status(404).json({ 
        status: "01", 
        message: "Guru tidak ditemukan" 
      });
    }
    res.json({ 
      status: "00", 
      message: "Data guru ditemukan", 
      data 
    });
  } catch (err) {
    console.error("Error getGuruById:", err);
    res.status(500).json({ 
      status: "01", 
      message: err.message 
    });
  }
};

// 🔹 Tambah guru
export const createGuru = async (req, res) => {
  try {
    const guru = await GuruModel.addGuru(req.body);
    res.json({ 
      status: "00", 
      message: "Guru berhasil ditambahkan", 
      data: guru 
    });
  } catch (err) {
    console.error("Error createGuru:", err);
    res.status(500).json({ 
      status: "01", 
      message: err.message 
    });
  }
};

// 🔹 Update guru
export const updateGuru = async (req, res) => {
  try {
    const guru = await GuruModel.updateGuru(req.params.id, req.body);
    if (!guru) {
      return res.status(404).json({ 
        status: "01", 
        message: "Guru tidak ditemukan" 
      });
    }
    res.json({ 
      status: "00", 
      message: "Guru berhasil diperbarui", 
      data: guru 
    });
  } catch (err) {
    console.error("Error updateGuru:", err);
    res.status(500).json({ 
      status: "01", 
      message: err.message 
    });
  }
};

// 🔹 Hapus guru
export const deleteGuru = async (req, res) => {
  try {
    await GuruModel.deleteGuru(req.params.id);
    res.json({ 
      status: "00", 
      message: "Guru berhasil dihapus" 
    });
  } catch (err) {
    console.error("Error deleteGuru:", err);
    res.status(500).json({ 
      status: "01", 
      message: err.message 
    });
  }
};