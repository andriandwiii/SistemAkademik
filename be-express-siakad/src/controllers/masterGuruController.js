import * as GuruModel from "../models/guruModel.js";
import { db } from "../core/config/knex.js";
import bcrypt from "bcrypt";

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
      return res
        .status(404)
        .json({ status: "01", message: "Guru tidak ditemukan" });
    }
    res.json({ status: "00", message: "Data guru ditemukan", data });
  } catch (err) {
    res.status(500).json({ status: "01", message: err.message });
  }
};

// 🔹 Ambil guru berdasarkan kode jabatan
export const getGuruByJabatanController = async (req, res) => {
  try {
    const { kode_jabatan } = req.params;
    const guruList = await GuruModel.getGuruByJabatan(kode_jabatan);

    if (!guruList || guruList.length === 0) {
      return res.status(404).json({
        status: "01",
        message: `Tidak ditemukan guru dengan jabatan kode ${kode_jabatan}`,
        datetime: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Data guru ditemukan",
      datetime: new Date().toISOString(),
      total: guruList.length,
      data: guruList,
    });
  } catch (err) {
    console.error("Error getGuruByJabatanController:", err);
    return res.status(500).json({
      status: "99",
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: new Date().toISOString(),
    });
  }
};

// 🔹 Ambil guru berdasarkan nama jabatan
export const getGuruByNamaJabatanController = async (req, res) => {
  try {
    const { nama_jabatan } = req.params;
    const guruList = await GuruModel.getGuruByNamaJabatan(nama_jabatan);

    if (!guruList || guruList.length === 0) {
      return res.status(404).json({
        status: "01",
        message: `Tidak ditemukan guru dengan nama jabatan '${nama_jabatan}'`,
        datetime: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Data guru ditemukan berdasarkan nama jabatan",
      datetime: new Date().toISOString(),
      total: guruList.length,
      data: guruList,
    });
  } catch (err) {
    console.error("Error getGuruByNamaJabatanController:", err);
    return res.status(500).json({
      status: "99",
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: new Date().toISOString(),
    });
  }
};

// 🔹 Tambah guru
export const createGuru = async (req, res) => {
  try {
    const {
      nip,
      nama,
      pangkat,
      kode_jabatan,
      status_kepegawaian,
      gender,
      tgl_lahir,
      tempat_lahir,
      email,
      no_telp,
      alamat,
      pendidikan_terakhir,
      tahun_lulus,
      universitas,
      no_sertifikat_pendidik,
      tahun_sertifikat,
      mapel_diampu,
      password,
    } = req.body;

    // file foto dari multer
    const fotoFile = req.file ? `/uploads/foto_guru/${req.file.filename}` : null;

    // 1️⃣ Buat akun user kalau belum ada
    const existingUser = await db("users").where("email", email).first();
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password || "123456", 10);
      await db("users").insert({
        email,
        name: nama,
        role: "GURU",
        password: hashedPassword,
        created_at: new Date(),
      });
    }

    // 2️⃣ Tambah data guru
    const guruData = {
      NIP: nip,
      NAMA: nama,
      PANGKAT: pangkat,
      KODE_JABATAN: kode_jabatan,
      STATUS_KEPEGAWAIAN: status_kepegawaian,
      GENDER: gender,
      TGL_LAHIR: tgl_lahir,
      TEMPAT_LAHIR: tempat_lahir,
      EMAIL: email,
      NO_TELP: no_telp,
      ALAMAT: alamat,
      FOTO: fotoFile,
      PENDIDIKAN_TERAKHIR: pendidikan_terakhir,
      TAHUN_LULUS: tahun_lulus,
      UNIVERSITAS: universitas,
      NO_SERTIFIKAT_PENDIDIK: no_sertifikat_pendidik,
      TAHUN_SERTIFIKAT: tahun_sertifikat,
      MAPEL_DIAMPU: mapel_diampu,
      created_at: new Date(),
    };

    await db("master_guru").insert(guruData);

    res.json({
      status: "00",
      message: "Guru berhasil ditambahkan dan akun GURU otomatis dibuat",
      guru: guruData,
    });
  } catch (err) {
    console.error("Error createGuru:", err);
    res.status(500).json({ status: "01", message: err.message });
  }
};


// 🔹 Update guru
export const updateGuru = async (req, res) => {
  try {
    const guruId = req.params.id;
    
    // Ambil data guru lama untuk cek email
    const existingGuru = await db("master_guru")
      .where("GURU_ID", guruId)
      .first();
    
    if (!existingGuru) {
      return res.status(404).json({
        status: "01",
        message: "Guru tidak ditemukan"
      });
    }

    // Ambil data dari request body
    const {
      nip,
      nama,
      pangkat,
      kode_jabatan,
      status_kepegawaian,
      gender,
      tgl_lahir,
      tempat_lahir,
      email,
      no_telp,
      alamat,
      pendidikan_terakhir,
      tahun_lulus,
      universitas,
      no_sertifikat_pendidik,
      tahun_sertifikat,
      mapel_diampu,
    } = req.body;

    // Handle foto upload
    let fotoFile = existingGuru.FOTO; // Keep old photo by default
    if (req.file) {
      fotoFile = `/uploads/foto_guru/${req.file.filename}`;
    }

    // Siapkan data untuk update
    const guruData = {
      NIP: nip,
      NAMA: nama,
      PANGKAT: pangkat,
      KODE_JABATAN: kode_jabatan || null,
      STATUS_KEPEGAWAIAN: status_kepegawaian,
      GENDER: gender,
      TGL_LAHIR: tgl_lahir,
      TEMPAT_LAHIR: tempat_lahir,
      EMAIL: email,
      NO_TELP: no_telp,
      ALAMAT: alamat,
      FOTO: fotoFile,
      PENDIDIKAN_TERAKHIR: pendidikan_terakhir,
      TAHUN_LULUS: tahun_lulus,
      UNIVERSITAS: universitas,
      NO_SERTIFIKAT_PENDIDIK: no_sertifikat_pendidik,
      TAHUN_SERTIFIKAT: tahun_sertifikat,
      MAPEL_DIAMPU: mapel_diampu,
      updated_at: new Date(),
    };

    // Update data guru
    await db("master_guru")
      .where("GURU_ID", guruId)
      .update(guruData);

    // Update user jika email berubah
    if (email !== existingGuru.EMAIL) {
      // Update email di tabel users
      await db("users")
        .where("email", existingGuru.EMAIL)
        .update({
          email: email,
          name: nama,
          updated_at: new Date(),
        });
    } else {
      // Update nama saja jika email tidak berubah
      await db("users")
        .where("email", email)
        .update({
          name: nama,
          updated_at: new Date(),
        });
    }

    // Ambil data lengkap setelah update
    const updatedGuru = await db("master_guru as g")
      .leftJoin("users as u", "g.EMAIL", "u.email")
      .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
      .select(
        "g.GURU_ID",
        "g.NIP",
        "g.NAMA",
        "g.PANGKAT",
        "g.KODE_JABATAN",
        "j.NAMA_JABATAN as JABATAN",
        "g.STATUS_KEPEGAWAIAN",
        "g.EMAIL",
        "g.TGL_LAHIR",
        "g.TEMPAT_LAHIR",
        "g.GENDER",
        "g.ALAMAT",
        "g.NO_TELP",
        "g.FOTO",
        "g.PENDIDIKAN_TERAKHIR",
        "g.TAHUN_LULUS",
        "g.UNIVERSITAS",
        "g.NO_SERTIFIKAT_PENDIDIK",
        "g.TAHUN_SERTIFIKAT",
        "g.MAPEL_DIAMPU",
        "g.created_at",
        "g.updated_at",
        "u.name as user_name",
        "u.role as user_role"
      )
      .where("g.GURU_ID", guruId)
      .first();

    res.json({
      status: "00",
      message: "Guru berhasil diperbarui",
      data: updatedGuru,
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
    const guru = await GuruModel.deleteGuru(req.params.id);
    res.json({
      status: "00",
      message: "Guru dan user terkait berhasil dihapus",
      guru,
    });
  } catch (err) {
    console.error("Error deleteGuru:", err);
    res.status(500).json({ status: "01", message: err.message });
  }
};
