import { db } from "../core/config/knex.js";

/**
 * Get all kurikulum
 **/
export const getAllKurikulum = async () => db("master_kurikulum").select("*");

/**
 * Get kurikulum by ID
 **/
export const getKurikulumById = async (id) =>
  db("master_kurikulum").where({ KURIKULUM_ID: id }).first();

/**
 * Get kurikulum by nama
 **/
export const getKurikulumByNama = async (nama) =>
  db("master_kurikulum").where({ NAMA_KURIKULUM: nama }).first();

/**
 * Create new kurikulum
 **/
export const createKurikulum = async ({
  NAMA_KURIKULUM,
  TAHUN,
  DESKRIPSI,
  STATUS,
}) => {
  if (!NAMA_KURIKULUM || !TAHUN) {
    throw new Error("NAMA_KURIKULUM dan TAHUN wajib diisi");
  }

  const [id] = await db("master_kurikulum").insert({
    NAMA_KURIKULUM,
    TAHUN,
    DESKRIPSI,
    STATUS,
  });
  return db("master_kurikulum").where({ KURIKULUM_ID: id }).first();
};

/**
 * Update kurikulum
 **/
export const updateKurikulum = async (
  id,
  { NAMA_KURIKULUM, TAHUN, DESKRIPSI, STATUS }
) => {
  if (!NAMA_KURIKULUM || !TAHUN) {
    throw new Error("NAMA_KURIKULUM dan TAHUN wajib diisi");
  }

  await db("master_kurikulum")
    .where({ KURIKULUM_ID: id })
    .update({ NAMA_KURIKULUM, TAHUN, DESKRIPSI, STATUS });
  return db("master_kurikulum").where({ KURIKULUM_ID: id }).first();
};

/**
 * Delete kurikulum
 **/
export const deleteKurikulum = async (id) =>
  db("master_kurikulum").where({ KURIKULUM_ID: id }).del();
