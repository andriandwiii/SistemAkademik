import { db } from "../core/config/knex.js";

const table = "master_tahun_ajaran";

// Ambil semua data
export const getAllTahunAjaran = async () => {
  return await db(table).select("*").orderBy("ID", "desc");
};

// Ambil berdasarkan ID
export const getTahunAjaranById = async (id) => {
  return await db(table).where("ID", id).first();
};

// Tambah data baru
export const addTahunAjaran = async (data) => {
  return await db(table).insert(data);
};

// Update data
export const updateTahunAjaran = async (id, data) => {
  return await db(table).where("ID", id).update(data);
};

// Hapus data
export const deleteTahunAjaran = async (id) => {
  return await db(table).where("ID", id).del();
};
