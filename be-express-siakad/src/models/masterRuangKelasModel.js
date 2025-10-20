import { db } from "../core/config/knex.js";

const table = "master_ruang_kelas";

// Ambil semua ruang kelas
export const getAllRuang = async () => {
  return db(table).select("*").orderBy("NAMA_RUANG", "asc");
};

// Ambil ruang kelas berdasarkan ID
export const getRuangById = async (id) => {
  return db(table).where({ RUANG_ID: id }).first();
};

// Tambah ruang kelas
export const createRuang = async (data) => {
  const [id] = await db(table).insert(data);
  return getRuangById(id);
};

// Update ruang kelas
export const updateRuang = async (id, data) => {
  const ruang = await getRuangById(id);
  if (!ruang) return null;
  await db(table).where({ RUANG_ID: id }).update({ ...data, updated_at: db.fn.now() });
  return getRuangById(id);
};

// Hapus ruang kelas
export const deleteRuang = async (id) => {
  const ruang = await getRuangById(id);
  if (!ruang) return null;
  await db(table).where({ RUANG_ID: id }).del();
  return ruang;
};
