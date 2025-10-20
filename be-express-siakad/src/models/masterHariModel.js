import { db } from "../core/config/knex.js";

const table = "master_hari";

// Ambil semua hari
export const getAllHari = async () => {
  return db(table).select("*").orderBy("URUTAN", "asc");
};

// Ambil hari berdasarkan ID
export const getHariById = async (id) => {
  return db(table).where({ HARI_ID: id }).first();
};

// Tambah hari
export const createHari = async (data) => {
  const [id] = await db(table).insert(data);
  return getHariById(id);
};

// Update hari
export const updateHari = async (id, data) => {
  const hari = await getHariById(id);
  if (!hari) return null;
  await db(table).where({ HARI_ID: id }).update(data);
  return getHariById(id);
};

// Hapus hari
export const deleteHari = async (id) => {
  const hari = await getHariById(id);
  if (!hari) return null;
  await db(table).where({ HARI_ID: id }).del();
  return hari;
};
