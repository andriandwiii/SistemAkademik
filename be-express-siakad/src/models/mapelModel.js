import { db } from "../core/config/knex.js";

const table = "master_mata_pelajaran";

// Ambil semua mapel
export const getAllMapel = async () => {
  return db(table).select("*").orderBy("MAPEL_ID", "desc");
};

// Ambil mapel by ID
export const getMapelById = async (id) => {
  return db(table).where({ MAPEL_ID: id }).first();
};

// Tambah mapel
export const createMapel = async (data) => {
  const [id] = await db(table).insert(data);
  return db(table).where({ MAPEL_ID: id }).first();
};

// Update mapel
export const updateMapel = async (id, data) => {
  const mapel = await db(table).where({ MAPEL_ID: id }).first();
  if (!mapel) return null;
  await db(table).where({ MAPEL_ID: id }).update(data);
  return db(table).where({ MAPEL_ID: id }).first();
};

// Hapus mapel
export const deleteMapel = async (id) => {
  const mapel = await db(table).where({ MAPEL_ID: id }).first();
  if (!mapel) return null;
  await db(table).where({ MAPEL_ID: id }).del();
  return mapel;
};
