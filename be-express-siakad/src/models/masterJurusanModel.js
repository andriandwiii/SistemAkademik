import { db } from "../core/config/knex.js";

/**
 * Get all jurusan
 **/
export const getAllJurusan = async () => {
  return db("master_jurusan").select("*");
};

/**
 * Get jurusan by ID (Primary Key)
 * INI BAGIAN YANG DIPERBAIKI
 **/
export const getJurusanById = async (id) => {
  // DIPERBAIKI: Mencari berdasarkan 'id' (angka primary key), 
  // bukan 'JURUSAN_ID' (kode string)
  return db("master_jurusan").where({ id: id }).first();
};

/**
 * Get jurusan by JURUSAN_ID (using KODE_JURUSAN)
 **/
export const getJurusanByKode = async (kode) => {
  // Fungsi ini sudah benar, digunakan untuk cek duplikat
  return db("master_jurusan").where({ JURUSAN_ID: kode }).first();
};

/**
 * Create new jurusan
 **/
export const createJurusan = async ({ JURUSAN_ID, NAMA_JURUSAN, DESKRIPSI }) => {
  if (!JURUSAN_ID || !NAMA_JURUSAN) {
    throw new Error("JURUSAN_ID dan NAMA_JURUSAN wajib diisi");
  }

  const [id] = await db("master_jurusan").insert({
    JURUSAN_ID,
    NAMA_JURUSAN,
    DESKRIPSI,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_jurusan").where({ id }).first();
};

/**
 * Update jurusan
 **/
export const updateJurusan = async (id, { JURUSAN_ID, NAMA_JURUSAN, DESKRIPSI }) => {
  if (!JURUSAN_ID || !NAMA_JURUSAN) {
    throw new Error("JURUSAN_ID dan NAMA_JURUSAN wajib diisi");
  }

  await db("master_jurusan")
    .where({ id }) // Ini sudah benar
    .update({
      JURUSAN_ID,
      NAMA_JURUSAN,
      DESKRIPSI,
      updated_at: db.fn.now(),
    });

  return db("master_jurusan").where({ id }).first();
};

/**
 * Delete jurusan
 **/
export const deleteJurusan = async (id) => {
  return db("master_jurusan").where({ id }).del(); // Ini sudah benar
};