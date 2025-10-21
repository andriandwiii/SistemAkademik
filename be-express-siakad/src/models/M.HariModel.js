import { db } from "../core/config/knex.js";

const table = "master_hari";

// Ambil semua hari
export const getAllHari = async () => {
  return await db(table).select("*").orderBy("URUTAN", "asc");
};

// Ambil hari by ID
export const getHariById = async (id) => {
  return await db(table).where("HARI_ID", id).first();
};

// Tambah hari
export const addHari = async (data) => {
  return await db(table).insert(data);
};

// Update hari
export const updateHari = async (id, data) => {
  return await db(table).where("HARI_ID", id).update(data);
};

// Hapus hari
export const deleteHari = async (id) => {
  return await db(table).where("HARI_ID", id).del();
};
