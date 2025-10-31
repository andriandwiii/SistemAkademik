// src/models/masterMataPelajaranModel.js
import { db } from "../core/config/knex.js";

const TABLE_NAME = "master_mata_pelajaran";

/** =============================
 * GET semua mata pelajaran
 * ============================= */
export const getAllMataPelajaran = async () => {
  return await db(TABLE_NAME).select("*").orderBy("created_at", "desc");
};

/** =============================
 * GET mata pelajaran berdasarkan ID
 * ============================= */
export const getMataPelajaranById = async (id) => {
  return await db(TABLE_NAME).where("ID", id).first();
};

/** =============================
 * GET mata pelajaran berdasarkan KODE_MAPEL (unik)
 * ============================= */
export const getMataPelajaranByKode = async (kode_mapel) => {
  return await db(TABLE_NAME).where("KODE_MAPEL", kode_mapel).first();
};

/** =============================
 * INSERT data baru
 * ============================= */
export const addMataPelajaran = async (data) => {
  return await db(TABLE_NAME).insert(data);
};

/** =============================
 * UPDATE data berdasarkan ID
 * ============================= */
export const updateMataPelajaran = async (id, data) => {
  return await db(TABLE_NAME).where("ID", id).update(data);
};

/** =============================
 * DELETE data berdasarkan ID
 * ============================= */
export const deleteMataPelajaran = async (id) => {
  return await db(TABLE_NAME).where("ID", id).del();
};
