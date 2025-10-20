import { db } from "../core/config/knex.js";

/**
 * Get all jurusan
 **/
export const getAllJurusan = async () => db("master_jurusan").select("*");

/**
 * Get jurusan by ID
 **/
export const getJurusanById = async (id) =>
  db("master_jurusan").where({ JURUSAN_ID: id }).first();

/**
 * Get jurusan by kode
 **/
export const getJurusanByKode = async (kode) =>
  db("master_jurusan").where({ KODE_JURUSAN: kode }).first();

/**
 * Create new jurusan
 **/
export const createJurusan = async ({ KODE_JURUSAN, KETERANGAN }) => {
  if (!KODE_JURUSAN || !KETERANGAN) {
    throw new Error("KODE_JURUSAN dan KETERANGAN wajib diisi");
  }

  const [id] = await db("master_jurusan").insert({
    KODE_JURUSAN,
    KETERANGAN,
  });

  return db("master_jurusan").where({ JURUSAN_ID: id }).first();
};

/**
 * Update jurusan
 **/
export const updateJurusan = async (id, { KODE_JURUSAN, KETERANGAN }) => {
  if (!KODE_JURUSAN || !KETERANGAN) {
    throw new Error("KODE_JURUSAN dan KETERANGAN wajib diisi");
  }

  await db("master_jurusan")
    .where({ JURUSAN_ID: id })
    .update({ KODE_JURUSAN, KETERANGAN });

  return db("master_jurusan").where({ JURUSAN_ID: id }).first();
};

/**
 * Delete jurusan
 **/
export const deleteJurusan = async (id) =>
  db("master_jurusan").where({ JURUSAN_ID: id }).del();
