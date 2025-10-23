import { db } from "../core/config/knex.js";

/**
 * Get all jabatan
 */
export const getAllJabatan = async () => {
  return db("master_jabatan").select("*").orderBy("id", "asc");
};

/**
 * Get jabatan by ID
 */
export const getJabatanById = async (id) => {
  return db("master_jabatan").where({ id }).first();
};

/**
 * Get jabatan by KODE_JABATAN
 */
export const getJabatanByKode = async (kode) => {
  return db("master_jabatan").where({ KODE_JABATAN: kode }).first();
};

/**
 * Create jabatan
 */
export const createJabatan = async ({ KODE_JABATAN, NAMA_JABATAN, STATUS }) => {
  const [id] = await db("master_jabatan").insert({
    KODE_JABATAN,
    NAMA_JABATAN,
    STATUS: STATUS || "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_jabatan").where({ id }).first();
};

/**
 * Update jabatan
 */
export const updateJabatan = async (id, { KODE_JABATAN, NAMA_JABATAN, STATUS }) => {
  await db("master_jabatan")
    .where({ id })
    .update({
      KODE_JABATAN,
      NAMA_JABATAN,
      STATUS,
      updated_at: db.fn.now(),
    });

  return db("master_jabatan").where({ id }).first();
};

/**
 * Delete jabatan
 */
export const deleteJabatan = async (id) => {
  return db("master_jabatan").where({ id }).del();
};
