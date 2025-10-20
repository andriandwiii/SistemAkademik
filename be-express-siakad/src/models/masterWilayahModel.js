import { db } from "../core/config/knex.js";

/**
 * Get all wilayah
 **/
export const getAllWilayah = async () => db("master_wilayah").select("*");

/**
 * Get wilayah by ID
 **/
export const getWilayahById = async (id) =>
  db("master_wilayah").where({ id }).first(); // Menggunakan id sebagai kolom

/**
 * Create new wilayah
 **/
export const createWilayah = async ({
  PROVINSI,
  KABUPATEN,
  KECAMATAN,
  DESA_KELURAHAN,
  KODEPOS,
  RT,
  RW,
  JALAN,
}) => {
  const [id] = await db("master_wilayah").insert({
    PROVINSI,
    KABUPATEN,
    KECAMATAN,
    DESA_KELURAHAN,
    KODEPOS,
    RT,
    RW,
    JALAN,
  });
  return db("master_wilayah").where({ id }).first(); // Menggunakan id sebagai kolom
};

/**
 * Update wilayah
 **/
export const updateWilayah = async (
  id,
  { PROVINSI, KABUPATEN, KECAMATAN, DESA_KELURAHAN, KODEPOS, RT, RW, JALAN }
) => {
  await db("master_wilayah")
    .where({ id }) // Menggunakan id sebagai kolom
    .update({ PROVINSI, KABUPATEN, KECAMATAN, DESA_KELURAHAN, KODEPOS, RT, RW, JALAN });
  return db("master_wilayah").where({ id }).first(); // Menggunakan id sebagai kolom
};

/**
 * Delete wilayah
 **/
export const deleteWilayah = async (id) =>
  db("master_wilayah").where({ id }).del(); // Pastikan menggunakan `id` di sini
// Menggunakan id sebagai kolom
