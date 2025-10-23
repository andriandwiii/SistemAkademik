import * as SiswaModel from "../models/siswaModel.js";
import { db } from "../core/config/knex.js";
import { hashPassword } from "../utils/hash.js";
import fs from "fs";
import path from "path";

// Helper function untuk hapus foto
const deleteFoto = (filename) => {
  if (filename) {
    const filepath = path.join("./uploads/foto_siswa", filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

// GET semua siswa
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
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// GET siswa by ID
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
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// POST siswa baru
export const addSiswa = async (req, res) => {
  const trx = await db.transaction();
  try {
    const {
      name,
      email,
      password,
      nis,
      nisn,
      nama,
      gender,
      tempat_lahir,
      tgl_lahir,
      agama,
      alamat,
      no_telp,
      status,
      gol_darah,
      tinggi,
      berat,
      kebutuhan_khusus,
      foto,
      orang_tua,
    } = req.body;

    // Ambil filename dari file upload (jika ada)
    const fotoFilename = req.file ? req.file.filename : foto;

    // Validasi minimal
    if (!name || !email || !password || !nis) {
      return res.status(400).json({
        status: "01",
        message: "Validasi gagal",
        datetime: new Date().toISOString(),
        errors: [
          !name && "Nama wajib diisi",
          !email && "Email wajib diisi",
          !password && "Password wajib diisi",
          !nis && "NIS wajib diisi",
        ].filter(Boolean),
      });
    }

    // Insert user login terlebih dahulu
    await trx("users").insert({
      name,
      email,
      password: await hashPassword(password),
      role: "SISWA",
    });

    // Mapping array orang_tua ke kolom
    let namaAyah = null, pekerjaanAyah = null, pendidikanAyah = null, alamatAyah = null, noTelpAyah = null;
    let namaIbu = null, pekerjaanIbu = null, pendidikanIbu = null, alamatIbu = null, noTelpIbu = null;
    let namaWali = null, pekerjaanWali = null, pendidikanWali = null, alamatWali = null, noTelpWali = null;

    if (Array.isArray(orang_tua)) {
      orang_tua.forEach((ortu) => {
        switch (ortu.jenis) {
          case "Ayah":
            namaAyah = ortu.nama;
            pekerjaanAyah = ortu.pekerjaan || null;
            pendidikanAyah = ortu.pendidikan || null;
            alamatAyah = ortu.alamat || null;
            noTelpAyah = ortu.no_hp || null;
            break;
          case "Ibu":
            namaIbu = ortu.nama;
            pekerjaanIbu = ortu.pekerjaan || null;
            pendidikanIbu = ortu.pendidikan || null;
            alamatIbu = ortu.alamat || null;
            noTelpIbu = ortu.no_hp || null;
            break;
          case "Wali":
            namaWali = ortu.nama;
            pekerjaanWali = ortu.pekerjaan || null;
            pendidikanWali = ortu.pendidikan || null;
            alamatWali = ortu.alamat || null;
            noTelpWali = ortu.no_hp || null;
            break;
        }
      });
    }

    // Insert siswa ke tabel master_siswa
    const [siswaId] = await trx("master_siswa").insert({
      EMAIL: email,
      NIS: nis,
      NISN: nisn,
      NAMA: nama,
      GENDER: gender,
      TEMPAT_LAHIR: tempat_lahir,
      TGL_LAHIR: tgl_lahir,
      AGAMA: agama,
      ALAMAT: alamat,
      NO_TELP: no_telp,
      STATUS: status || "Aktif",
      GOL_DARAH: gol_darah,
      TINGGI: tinggi,
      BERAT: berat,
      KEBUTUHAN_KHUSUS: kebutuhan_khusus,
      FOTO: fotoFilename,
      NAMA_AYAH: namaAyah,
      PEKERJAAN_AYAH: pekerjaanAyah,
      PENDIDIKAN_AYAH: pendidikanAyah,
      ALAMAT_AYAH: alamatAyah,
      NO_TELP_AYAH: noTelpAyah,
      NAMA_IBU: namaIbu,
      PEKERJAAN_IBU: pekerjaanIbu,
      PENDIDIKAN_IBU: pendidikanIbu,
      ALAMAT_IBU: alamatIbu,
      NO_TELP_IBU: noTelpIbu,
      NAMA_WALI: namaWali,
      PEKERJAAN_WALI: pekerjaanWali,
      PENDIDIKAN_WALI: pendidikanWali,
      ALAMAT_WALI: alamatWali,
      NO_TELP_WALI: noTelpWali,
    });

    await trx.commit();

    // Ambil data siswa yang baru dibuat
    const newSiswa = await SiswaModel.getSiswaByIdWithUser(siswaId);

    res.status(201).json({
      status: "00",
      message: "Siswa dan Orang Tua berhasil ditambahkan",
      datetime: new Date().toISOString(),
      data: {
        siswa_id: siswaId,
        user: {
          name: name,
          email: email,
          role: "SISWA",
        },
        siswa: newSiswa,
      },
    });
  } catch (err) {
    await trx.rollback();
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// UPDATE siswa
export const updateSiswa = async (req, res) => {
  const trx = await db.transaction();
  try {
    const siswa = await SiswaModel.getSiswaByIdWithUser(req.params.id);
    if (!siswa) {
      return res.status(404).json({
        status: "04",
        message: "Siswa tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

    const {
      name,
      email,
      password,
      nis,
      nisn,
      nama,
      gender,
      tempat_lahir,
      tgl_lahir,
      agama,
      alamat,
      no_telp,
      status,
      gol_darah,
      tinggi,
      berat,
      kebutuhan_khusus,
      foto,
      orang_tua,
    } = req.body;

    // Ambil filename dari file upload (jika ada)
    const fotoFilename = req.file ? req.file.filename : foto;

    // Update user login jika ada perubahan
    const updateUser = {};
    if (name) updateUser.name = name;
    if (email) updateUser.email = email;
    if (password) updateUser.password = await hashPassword(password);

    if (Object.keys(updateUser).length > 0) {
      await trx("users").where({ email: siswa.EMAIL }).update(updateUser);
    }

    // Mapping array orang_tua ke kolom
    let updateData = {
      EMAIL: email || siswa.EMAIL,
      NIS: nis,
      NISN: nisn,
      NAMA: nama,
      GENDER: gender,
      TEMPAT_LAHIR: tempat_lahir,
      TGL_LAHIR: tgl_lahir,
      AGAMA: agama,
      ALAMAT: alamat,
      NO_TELP: no_telp,
      STATUS: status,
      GOL_DARAH: gol_darah,
      TINGGI: tinggi,
      BERAT: berat,
      KEBUTUHAN_KHUSUS: kebutuhan_khusus,
      FOTO: fotoFilename,
    };

    // Hapus undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Proses data orang tua jika ada
    if (Array.isArray(orang_tua)) {
      orang_tua.forEach((ortu) => {
        switch (ortu.jenis) {
          case "Ayah":
            updateData.NAMA_AYAH = ortu.nama;
            updateData.PEKERJAAN_AYAH = ortu.pekerjaan || null;
            updateData.PENDIDIKAN_AYAH = ortu.pendidikan || null;
            updateData.ALAMAT_AYAH = ortu.alamat || null;
            updateData.NO_TELP_AYAH = ortu.no_hp || null;
            break;
          case "Ibu":
            updateData.NAMA_IBU = ortu.nama;
            updateData.PEKERJAAN_IBU = ortu.pekerjaan || null;
            updateData.PENDIDIKAN_IBU = ortu.pendidikan || null;
            updateData.ALAMAT_IBU = ortu.alamat || null;
            updateData.NO_TELP_IBU = ortu.no_hp || null;
            break;
          case "Wali":
            updateData.NAMA_WALI = ortu.nama;
            updateData.PEKERJAAN_WALI = ortu.pekerjaan || null;
            updateData.PENDIDIKAN_WALI = ortu.pendidikan || null;
            updateData.ALAMAT_WALI = ortu.alamat || null;
            updateData.NO_TELP_WALI = ortu.no_hp || null;
            break;
        }
      });
    }

    // Hapus foto lama jika ada foto baru
    if (req.file && siswa.FOTO) {
      deleteFoto(siswa.FOTO);
    }

    // Update siswa
    await trx("master_siswa")
      .where("SISWA_ID", req.params.id)
      .update(updateData);

    await trx.commit();

    // Ambil data terbaru
    const updatedSiswa = await SiswaModel.getSiswaByIdWithUser(req.params.id);

    res.status(200).json({
      status: "00",
      message: "Siswa berhasil diperbarui",
      datetime: new Date().toISOString(),
      data: updatedSiswa,
    });
  } catch (err) {
    await trx.rollback();
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui data siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};

// DELETE siswa
export const deleteSiswa = async (req, res) => {
  try {
    // Ambil data siswa terlebih dahulu untuk mendapatkan nama foto
    const siswa = await SiswaModel.getSiswaByIdWithUser(req.params.id);
    
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

    // Hapus data siswa
    await SiswaModel.deleteSiswa(req.params.id);

    res.status(200).json({
      status: "00",
      message: "Siswa berhasil dihapus beserta data user login",
      datetime: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus siswa",
      datetime: new Date().toISOString(),
      error: err.message,
    });
  }
};