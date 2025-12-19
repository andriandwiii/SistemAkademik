// models/masterJenisUjianModel.js
import { db } from "../core/config/knex.js";

/**
 * Ambil semua data jenis ujian
 */
export const getAllJenisUjian = async () => {
  return await db("master_jenis_ujian")
    .select("*")
    .orderBy("ID", "asc");
};

/**
 * Ambil jenis ujian berdasarkan ID
 */
export const getJenisUjianById = async (id) => {
  return await db("master_jenis_ujian")
    .where({ ID: id })
    .first();
};

/**
 * Tambah jenis ujian
 */
export const addJenisUjian = async (data) => {
  return await db("master_jenis_ujian").insert({
    KODE_UJIAN: data.KODE_UJIAN,
    NAMA_UJIAN: data.NAMA_UJIAN,
    STATUS: data.STATUS || "Aktif",
  });
};

/**
 * Update jenis ujian
 */
export const updateJenisUjian = async (id, data) => {
  return await db("master_jenis_ujian")
    .where({ ID: id })
    .update({
      KODE_UJIAN: data.KODE_UJIAN,
      NAMA_UJIAN: data.NAMA_UJIAN,
      STATUS: data.STATUS,
      updated_at: db.fn.now(),
    });
};

/**
 * Hapus jenis ujian
 */
export const deleteJenisUjian = async (id) => {
  return await db("master_jenis_ujian")
    .where({ ID: id })
    .del();
};
