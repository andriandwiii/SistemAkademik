import { db } from "../core/config/knex.js";

/**
 * Get all gedung
 **/
export const getAllGedung = async () => {
  return db("master_gedung").select("*").orderBy("GEDUNG_ID", "asc");
};

/**
 * Get gedung by ID (Primary Key)
 **/
export const getGedungById = async (id) => {
  return db("master_gedung").where({ id }).first();
};

/**
 * Get gedung by GEDUNG_ID (kode unik)
 **/
export const getGedungByKode = async (kode) => {
  return db("master_gedung").where({ GEDUNG_ID: kode }).first();
};

/**
 * Ambil gedung terakhir (untuk auto-generate kode GEDUNG_ID jika dibutuhkan)
 **/
export const getLastGedung = async () => {
  return db("master_gedung").orderBy("GEDUNG_ID", "desc").first();
};

/**
 * Create new gedung
 **/
export const createGedung = async ({ GEDUNG_ID, NAMA_GEDUNG, LOKASI }) => {
  if (!GEDUNG_ID || !NAMA_GEDUNG) {
    throw new Error("GEDUNG_ID dan NAMA_GEDUNG wajib diisi");
  }

  const [id] = await db("master_gedung").insert({
    GEDUNG_ID,
    NAMA_GEDUNG,
    LOKASI,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_gedung").where({ id }).first();
};

/**
 * Update gedung
 **/
export const updateGedung = async (id, { GEDUNG_ID, NAMA_GEDUNG, LOKASI }) => {
  // Jika GEDUNG_ID tidak dikirim, jangan dipaksa wajib ada
  if (!NAMA_GEDUNG) {
    throw new Error("NAMA_GEDUNG wajib diisi");
  }

  const dataToUpdate = {
    NAMA_GEDUNG,
    LOKASI,
    updated_at: db.fn.now(),
  };

  // Update GEDUNG_ID hanya jika dikirim dari body (opsional)
  if (GEDUNG_ID) dataToUpdate.GEDUNG_ID = GEDUNG_ID;

  await db("master_gedung").where({ id }).update(dataToUpdate);

  return db("master_gedung").where({ id }).first();
};

/**
 * Delete gedung
 **/
export const deleteGedung = async (id) => {
  return db("master_gedung").where({ id }).del();
};
