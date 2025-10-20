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
    const [userId] = await trx("users").insert({
      name,
      email,
      password: await hashPassword(password),
      role: "SISWA",
    });

    // Insert siswa
    const [siswaId] = await trx("m_siswa").insert({
      user_id: userId,
      NIS: nis,
      NISN: nisn,
      NAMA: nama,
      GENDER: gender,
      TEMPAT_LAHIR: tempat_lahir,
      TGL_LAHIR: tgl_lahir,
      AGAMA: agama,
      ALAMAT: alamat,
      NO_TELP: no_telp,
      EMAIL: email,
      STATUS: status,
      GOL_DARAH: gol_darah,
      TINGGI: tinggi,
      BERAT: berat,
      KEBUTUHAN_KHUSUS: kebutuhan_khusus,
      FOTO: foto,
    });

    // Insert orang tua
    if (orang_tua && orang_tua.length > 0) {
      for (const ortu of orang_tua) {
        await trx("m_orangtua_wali").insert({
          SISWA_ID: siswaId,
          JENIS: ortu.jenis,
          NAMA: ortu.nama,
          PEKERJAAN: ortu.pekerjaan,
          PENDIDIKAN: ortu.pendidikan,
          ALAMAT: ortu.alamat,
          NO_HP: ortu.no_hp,
        });
      }
    }

await trx.commit();

  res.status(201).json({
    status: "00",
    message: "Siswa dan Orang Tua berhasil ditambahkan",
    datetime: new Date().toISOString(),
    data: {
      siswa_id: siswaId,
      user: {
        id: userId,
        name: req.body.name,    // ambil dari input request
        email: req.body.email,  
        role: "SISWA"
      }
    }
  });
  } catch (err) {
    await trx.rollback();
    res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan siswa",
      datetime: new Date().toISOString(),
      error: err.message
    });
}};


// UPDATE siswa
export const updateSiswa = async (req, res) => {
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
      NIS,
      NISN,
      NAMA,
      GENDER,
      TEMPAT_LAHIR,
      TGL_LAHIR,
      AGAMA,
      ALAMAT,
      NO_TELP,
      STATUS,
      GOL_DARAH,
      TINGGI,
      BERAT,
      KEBUTUHAN_KHUSUS,
      FOTO,
    } = req.body;

    // update user login
    const updateUser = {};
    if (name) updateUser.name = name;
    if (email) updateUser.email = email;
    if (password) updateUser.password = await hashPassword(password);

    if (Object.keys(updateUser).length > 0) {
      await db("users").where({ id: siswa.user_id }).update(updateUser);
    }

    // update siswa
    const updatedSiswa = await SiswaModel.updateSiswa(req.params.id, {
      NIS,
      NISN,
      NAMA,
      GENDER,
      TEMPAT_LAHIR,
      TGL_LAHIR,
      AGAMA,
      ALAMAT,
      NO_TELP,
      EMAIL: email,
      STATUS,
      GOL_DARAH,
      TINGGI,
      BERAT,
      KEBUTUHAN_KHUSUS,
      FOTO,
    });

    res.status(200).json({
      status: "00",
      message: "Siswa berhasil diperbarui",
      datetime: new Date().toISOString(),
      data: updatedSiswa,
    });
  } catch (err) {
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
      message: "Siswa berhasil dihapus beserta data orang tua dan user login",
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
