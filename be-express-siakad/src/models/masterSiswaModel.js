import { db } from "../core/config/knex.js"; // Pastikan path knex.js benar

// Menampilkan semua siswa
export const getAllMasterSiswa = async () => db("master_siswa").select("*");

// Menampilkan siswa berdasarkan ID
export const getMasterSiswaById = async (id) => {
  return db("master_siswa").where({ SISWA_ID: id }).first(); // Mengambil satu data berdasarkan ID
};

// Menambahkan siswa baru
export const addMasterSiswa = async ({ NIS, NISN, NAMA, GENDER, TGL_LAHIR, STATUS, EMAIL }) => {
  const [id] = await db("master_siswa").insert({
    NIS,
    NISN,
    NAMA,
    GENDER,
    TGL_LAHIR,
    STATUS,
    EMAIL,
  });
  return db("master_siswa").where({ SISWA_ID: id }).first();
};

// Memperbarui data siswa
export const updateMasterSiswa = async (id, { NIS, NISN, NAMA, GENDER, TGL_LAHIR, STATUS, EMAIL }) => {
  await db("master_siswa").where({ SISWA_ID: id }).update({
    NIS,
    NISN,
    NAMA,
    GENDER,
    TGL_LAHIR,
    STATUS,
    EMAIL,
  });
  return db("master_siswa").where({ SISWA_ID: id }).first();
};

// Menghapus siswa berdasarkan ID
export const deleteMasterSiswa = async (id) => {
  await db("master_siswa").where({ SISWA_ID: id }).del();
};
