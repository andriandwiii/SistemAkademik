import { db } from "../core/config/knex.js";

const table = "master_tingkatan";

// Ambil semua tingkatan
export const getAllTingkatan = async () => {
  return db(table).select("*").orderBy("TINGKATAN", "asc");
};

// Ambil tingkatan berdasarkan ID
export const getTingkatanById = async (id) => {
  return db(table).where({ TINGKATAN_ID: id }).first();
};

// Tambah tingkatan
export const createTingkatan = async (data) => {
  const [id] = await db(table).insert(data);
  return getTingkatanById(id);
};

// Update tingkatan
export const updateTingkatan = async (id, data) => {
  const tingkatan = await getTingkatanById(id);
  if (!tingkatan) return null;
  await db(table).where({ TINGKATAN_ID: id }).update(data);
  return getTingkatanById(id);
};

// Hapus tingkatan
export const deleteTingkatan = async (id) => {
  const tingkatan = await getTingkatanById(id);
  if (!tingkatan) return null;
  await db(table).where({ TINGKATAN_ID: id }).del();
  return tingkatan;
};
