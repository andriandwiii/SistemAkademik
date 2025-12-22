import { db } from "../core/config/knex.js";

const table = "master_kategori_siswa";

/**
 * Get all kategori siswa (aktif)
 */
export const getAllKategori = async () => {
  return db(table)
    .where("STATUS", "Aktif")
    .orderBy("PRIORITAS");
};

/**
 * Get kategori by ID
 */
export const getKategoriById = async (kategoriId) => {
  return db(table).where("KATEGORI_ID", kategoriId).first();
};

/**
 * Create new kategori
 */
export const createKategori = async (data) => {
  // Generate KATEGORI_ID
  const last = await db(table)
    .select("KATEGORI_ID")
    .orderBy("id", "desc")
    .first();

  let nextNumber = 1;
  if (last && last.KATEGORI_ID) {
    const numericPart = parseInt(last.KATEGORI_ID.replace("KAT", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }
  const kategoriId = `KAT${nextNumber.toString().padStart(3, "0")}`;

  const [id] = await db(table).insert({
    ...data,
    KATEGORI_ID: kategoriId
  });
  
  return db(table).where("id", id).first();
};

/**
 * Update kategori
 */
export const updateKategori = async (kategoriId, data) => {
  await db(table).where("KATEGORI_ID", kategoriId).update(data);
  return db(table).where("KATEGORI_ID", kategoriId).first();
};

/**
 * Delete kategori (soft delete via status)
 */
export const deleteKategori = async (kategoriId) => {
  await db(table).where("KATEGORI_ID", kategoriId).update({ STATUS: "Tidak Aktif" });
  return db(table).where("KATEGORI_ID", kategoriId).first();
};

/**
 * Hard delete kategori
 */
export const hardDeleteKategori = async (kategoriId) => {
  const kategori = await db(table).where("KATEGORI_ID", kategoriId).first();
  if (!kategori) return null;
  
  await db(table).where("KATEGORI_ID", kategoriId).del();
  return kategori;
};