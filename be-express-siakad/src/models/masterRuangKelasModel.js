import { db } from "../core/config/knex.js";

/**
 * Get all ruang
 **/
export const getAllRuang = async () => {
  return db("master_ruang").select("*").orderBy("RUANG_ID", "asc");
};

/**
 * Get ruang by ID (Primary Key)
 **/
export const getRuangById = async (id) => {
  return db("master_ruang").where({ id }).first();
};

/**
 * Get ruang by RUANG_ID (kode unik)
 **/
export const getRuangByKode = async (kode) => {
  return db("master_ruang").where({ RUANG_ID: kode }).first();
};

/**
 * Ambil ruang terakhir (untuk auto-generate kode RUANG_ID jika dibutuhkan)
 **/
export const getLastRuang = async () => {
  return db("master_ruang").orderBy("RUANG_ID", "desc").first();
};

/**
 * Create new ruang
 **/
export const createRuang = async ({ RUANG_ID, NAMA_RUANG, DESKRIPSI }) => {
  if (!RUANG_ID || !NAMA_RUANG) {
    throw new Error("RUANG_ID dan NAMA_RUANG wajib diisi");
  }

  const [id] = await db("master_ruang").insert({
    RUANG_ID,
    NAMA_RUANG,
    DESKRIPSI,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_ruang").where({ id }).first();
};

/**
 * Update ruang
 **/
export const updateRuang = async (id, { RUANG_ID, NAMA_RUANG, DESKRIPSI }) => {
  if (!NAMA_RUANG) {
    throw new Error("NAMA_RUANG wajib diisi");
  }

  const dataToUpdate = {
    NAMA_RUANG,
    DESKRIPSI,
    updated_at: db.fn.now(),
  };

  if (RUANG_ID) dataToUpdate.RUANG_ID = RUANG_ID;

  await db("master_ruang").where({ id }).update(dataToUpdate);

  return db("master_ruang").where({ id }).first();
};

/**
 * Delete ruang
 **/
export const deleteRuang = async (id) => {
  return db("master_ruang").where({ id }).del();
};
