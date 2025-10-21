// models/masterTahunAjaranModel.js
import { db } from "../core/config/knex.js";

/**
 * Ambil semua data tahun ajaran
 */
export const getAllTahunAjaran = async () => {
  return await db("master_tahun_ajaran").select("*").orderBy("ID", "asc");
};

/**
 * Ambil data tahun ajaran berdasarkan ID
 */
export const getTahunAjaranById = async (id) => {
  return await db("master_tahun_ajaran").where({ ID: id }).first();
};

/**
 * Tambah data tahun ajaran
 */
export const addTahunAjaran = async (data) => {
  return await db("master_tahun_ajaran").insert({
    TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: data.NAMA_TAHUN_AJARAN,
    STATUS: data.STATUS || "Tidak Aktif", // default jika tidak diisi
  });
};

/**
 * Update data tahun ajaran
 */
export const updateTahunAjaran = async (id, data) => {
  return await db("master_tahun_ajaran")
    .where({ ID: id })
    .update({
      TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
      NAMA_TAHUN_AJARAN: data.NAMA_TAHUN_AJARAN,
      STATUS: data.STATUS,
      updated_at: db.fn.now(),
    });
};

/**
 * Hapus data tahun ajaran
 */
export const deleteTahunAjaran = async (id) => {
  return await db("master_tahun_ajaran").where({ ID: id }).del();
};
