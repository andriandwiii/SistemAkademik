import { db } from "../core/config/knex.js";

/**
 * Get all tingkatan
 **/
export const getAllTingkatan = async () => {
  return db("master_tingkatan").select("*").orderBy("TINGKATAN_ID", "asc");
};

/**
 * Get tingkatan by ID (Primary Key)
 **/
export const getTingkatanById = async (id) => {
  return db("master_tingkatan").where({ id }).first();
};

/**
 * Get tingkatan by TINGKATAN_ID (kode unik)
 **/
export const getTingkatanByKode = async (kode) => {
  return db("master_tingkatan").where({ TINGKATAN_ID: kode }).first();
};

/**
 * Ambil tingkatan terakhir (untuk auto-generate kode TINGKATAN_ID jika dibutuhkan)
 **/
export const getLastTingkatan = async () => {
  return db("master_tingkatan").orderBy("TINGKATAN_ID", "desc").first();
};

/**
 * Create new tingkatan
 **/
export const createTingkatan = async ({ TINGKATAN_ID, TINGKATAN, STATUS }) => {
  if (!TINGKATAN_ID || !TINGKATAN) {
    throw new Error("TINGKATAN_ID dan TINGKATAN wajib diisi");
  }

  const [id] = await db("master_tingkatan").insert({
    TINGKATAN_ID,
    TINGKATAN,
    STATUS: STATUS ?? "aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_tingkatan").where({ id }).first();
};

/**
 * Update tingkatan
 **/
export const updateTingkatan = async (id, { TINGKATAN_ID, TINGKATAN, STATUS }) => {
  if (!TINGKATAN) {
    throw new Error("TINGKATAN wajib diisi");
  }

  const dataToUpdate = {
    TINGKATAN,
    STATUS,
    updated_at: db.fn.now(),
  };

  if (TINGKATAN_ID) dataToUpdate.TINGKATAN_ID = TINGKATAN_ID;

  await db("master_tingkatan").where({ id }).update(dataToUpdate);

  return db("master_tingkatan").where({ id }).first();
};

/**
 * Delete tingkatan
 **/
export const deleteTingkatan = async (id) => {
  return db("master_tingkatan").where({ id }).del();
};
