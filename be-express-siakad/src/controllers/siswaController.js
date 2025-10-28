import * as SiswaModel from "../models/siswaModel.js";
import { db } from "../core/config/knex.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

// Helper function untuk hapus foto
const deleteFoto = (fotoPath) => {
  if (fotoPath) {
    // Extract filename dari path
    const filename = fotoPath.replace("/uploads/foto_siswa/", "");
    const filepath = path.join("./uploads/foto_siswa", filename);
    
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log("Foto berhasil dihapus:", filepath);
      } catch (err) {
        console.error("Error menghapus foto:", err);
      }
    }
  }
};

// 🔹 GET semua siswa
export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await SiswaModel.getAllSiswaWithUser();
    res.status(200).json({
      status: "00",
      message: "Data siswa berhasil diambil",
      datetime: new Date().toISOString(),
      total: siswa.length,
      data: siswa,
    });
  } catch (err) {
    console.error("Error getAllSiswa:", err);
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// 🔹 GET siswa by ID
export const getSiswaById = async (req, res) => {
  try {
    const siswa = await SiswaModel.getSiswaByIdWithUser(req.params.id);
    
    if (!siswa) {
      return res.status(404).json({
        status: "04",
        message: "Siswa tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }
    
    res.status(200).json({
      status: "00",
      message: "Data siswa berhasil diambil",
      datetime: new Date().toISOString(),
      data: siswa,
    });
  } catch (err) {
    console.error("Error getSiswaById:", err);
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// 🔹 POST siswa baru
export const addSiswa = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi field wajib
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "01",
        message: "Validasi gagal: Nama, Email, dan Password wajib diisi",
        datetime: new Date().toISOString(),
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await db("users").where("email", email).first();
    if (existingUser) {
      return res.status(400).json({
        status: "01",
        message: "Email sudah terdaftar",
        datetime: new Date().toISOString(),
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user login
    await db("users").insert({
      name,
      email,
      password: hashedPassword,
      role: "SISWA",
      created_at: new Date(),
    });

    // Siapkan data siswa
    const siswaData = {
      ...req.body,
      foto: req.file ? `/uploads/foto_siswa/${req.file.filename}` : null,
    };

    // Panggil model untuk create siswa
    const newSiswa = await SiswaModel.createSiswa(siswaData);

    res.status(201).json({
      status: "00",
      message: "Siswa berhasil ditambahkan",
      datetime: new Date().toISOString(),
      data: newSiswa,
    });
  } catch (err) {
    console.error("Error addSiswa:", err);
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// 🔹 PUT update siswa
export const updateSiswa = async (req, res) => {
  try {
    const siswaId = req.params.id;

    // Cek apakah siswa ada
    const existingSiswa = await SiswaModel.getSiswaByIdWithUser(siswaId);
    if (!existingSiswa) {
      return res.status(404).json({
        status: "04",
        message: "Siswa tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

    // Siapkan data untuk update
    const siswaData = {
      ...req.body,
    };

    // Handle foto baru
    if (req.file) {
      siswaData.foto = `/uploads/foto_siswa/${req.file.filename}`;
      
      // Hapus foto lama jika ada
      if (existingSiswa.FOTO) {
        deleteFoto(existingSiswa.FOTO);
      }
    }

    // Panggil model untuk update
    const updatedSiswa = await SiswaModel.updateSiswa(siswaId, siswaData);

    res.status(200).json({
      status: "00",
      message: "Siswa berhasil diperbarui",
      datetime: new Date().toISOString(),
      data: updatedSiswa,
    });
  } catch (err) {
    console.error("Error updateSiswa:", err);
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// 🔹 DELETE siswa
export const deleteSiswa = async (req, res) => {
  try {
    const siswaId = req.params.id;

    // Ambil data siswa untuk mendapatkan foto
    const siswa = await SiswaModel.getSiswaByIdWithUser(siswaId);
    
    if (!siswa) {
      return res.status(404).json({
        status: "04",
        message: "Siswa tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

    // Hapus foto jika ada
    if (siswa.FOTO) {
      deleteFoto(siswa.FOTO);
    }

    // Hapus siswa
    await SiswaModel.deleteSiswa(siswaId);

    res.status(200).json({
      status: "00",
      message: "Siswa berhasil dihapus beserta data user login",
      datetime: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error deleteSiswa:", err);
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};