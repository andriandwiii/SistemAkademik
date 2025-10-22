import * as SiswaModel from "../models/siswaModel.js";
import { db } from "../core/config/knex.js";
import { hashPassword } from "../utils/hash.js";

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

    // Insert user login
    await trx("users").insert({
      name,
      email,
      password: await hashPassword(password),
      role: "SISWA",
    });

    // Insert siswa dengan data orang tua
    const siswaData = {
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
      FOTO: foto,
      orang_tua: orang_tua,
    };

    const newSiswa = await SiswaModel.addSiswa(siswaData, trx);

    await trx.commit();

    res.status(201).json({
      status: "00",
      message: "Siswa dan Orang Tua berhasil ditambahkan",
      datetime: new Date().toISOString(),
      data: {
        siswa_id: newSiswa.SISWA_ID,
        user: {
          name: name,
          email: email,
          role: "SISWA",
        },
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
      FOTO: foto,
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
    const siswa = await SiswaModel.deleteSiswa(req.params.id);
    if (!siswa) {
      return res.status(404).json({
        status: "04",
        message: "Siswa tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

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