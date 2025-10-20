import { db } from "../core/config/knex.js";

/**
 * Get all ujian
 **/
export const getAllUjian = async () => db("master_ujian").select("*");

/**
 * Get ujian by ID
 **/
export const getUjianById = async (id) =>
  db("master_ujian").where({ UJIAN_ID: id }).first(); // Menggunakan UJIAN_ID sebagai kolom

/**
 * Create new ujian
 **/
export const createUjian = async ({
  NAMA_UJIAN,
  JENIS_UJIAN,
  TANGGAL_UJIAN,
  MAPEL_ID,
}) => {
  const [id] = await db("master_ujian").insert({
    NAMA_UJIAN,
    JENIS_UJIAN,
    TANGGAL_UJIAN,
    MAPEL_ID,
  });
  return db("master_ujian").where({ UJIAN_ID: id }).first(); // Menggunakan UJIAN_ID sebagai kolom
};

/**
 * Update ujian
 **/
export const updateUjian = async (
  id,
  { NAMA_UJIAN, JENIS_UJIAN, TANGGAL_UJIAN, MAPEL_ID }
) => {
  await db("master_ujian")
    .where({ UJIAN_ID: id }) // Menggunakan UJIAN_ID sebagai kolom
    .update({ NAMA_UJIAN, JENIS_UJIAN, TANGGAL_UJIAN, MAPEL_ID });
  return db("master_ujian").where({ UJIAN_ID: id }).first(); // Menggunakan UJIAN_ID sebagai kolom
};

/**
 * Delete ujian
 **/
export const deleteUjian = async (id) =>
  db("master_ujian").where({ UJIAN_ID: id }).del(); // Pastikan menggunakan UJIAN_ID di sini
