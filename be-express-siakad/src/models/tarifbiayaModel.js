import { db } from "../core/config/knex.js";

const table = "master_tarif_biaya";

/**
 * Get all tarif with filters
 */
export const getAllTarif = async (filters = {}) => {
  let query = db(`${table} as t`)
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .leftJoin("master_kategori_siswa as kat", "t.KATEGORI_ID", "kat.KATEGORI_ID")
    .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .leftJoin("master_tingkatan as ting", "t.TINGKATAN_ID", "ting.TINGKATAN_ID")
    .select(
      "t.*",
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA",
      "kat.NAMA_KATEGORI",
      "ta.NAMA_TAHUN_AJARAN",
      "ting.TINGKATAN"
    )
    .where("t.STATUS", "Aktif");

  if (filters.tahunAjaranId) query.where("t.TAHUN_AJARAN_ID", filters.tahunAjaranId);
  if (filters.kategoriId) query.where("t.KATEGORI_ID", filters.kategoriId);
  if (filters.tingkatanId) query.where("t.TINGKATAN_ID", filters.tingkatanId);
  if (filters.komponenId) query.where("t.KOMPONEN_ID", filters.komponenId);

  return query.orderBy("k.URUTAN");
};

/**
 * Get tarif by ID
 */
export const getTarifById = async (tarifId) => {
  return db(`${table} as t`)
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .leftJoin("master_kategori_siswa as kat", "t.KATEGORI_ID", "kat.KATEGORI_ID")
    .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .leftJoin("master_tingkatan as ting", "t.TINGKATAN_ID", "ting.TINGKATAN_ID")
    .select(
      "t.*",
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA",
      "kat.NAMA_KATEGORI",
      "ta.NAMA_TAHUN_AJARAN",
      "ting.TINGKATAN"
    )
    .where("t.TARIF_ID", tarifId)
    .first();
};

/**
 * Create new tarif
 */
export const createTarif = async (data) => {
  // Generate TARIF_ID
  const last = await db(table)
    .select("TARIF_ID")
    .orderBy("id", "desc")
    .first();

  let nextNumber = 1;
  if (last && last.TARIF_ID) {
    const numericPart = parseInt(last.TARIF_ID.replace("TARIF", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }
  const tarifId = `TARIF${nextNumber.toString().padStart(5, "0")}`;

  const [id] = await db(table).insert({
    ...data,
    TARIF_ID: tarifId
  });
  
  return db(table).where("id", id).first();
};

/**
 * Update tarif
 */
export const updateTarif = async (tarifId, data) => {
  await db(table).where("TARIF_ID", tarifId).update(data);
  return db(table).where("TARIF_ID", tarifId).first();
};

/**
 * Delete tarif (soft delete)
 */
export const deleteTarif = async (tarifId) => {
  await db(table).where("TARIF_ID", tarifId).update({ STATUS: "Tidak Aktif" });
  return db(table).where("TARIF_ID", tarifId).first();
};

/**
 * Hard delete tarif
 */
export const hardDeleteTarif = async (tarifId) => {
  const tarif = await db(table).where("TARIF_ID", tarifId).first();
  if (!tarif) return null;
  
  await db(table).where("TARIF_ID", tarifId).del();
  return tarif;
};

/**
 * Get tarif by specific combination
 */
export const getTarifByKombinasi = async ({
  komponenId,
  kategoriId,
  tahunAjaranId,
  tingkatanId = null
}) => {
  const query = db(table)
    .where({
      KOMPONEN_ID: komponenId,
      KATEGORI_ID: kategoriId,
      TAHUN_AJARAN_ID: tahunAjaranId,
      STATUS: "Aktif"
    });

  if (tingkatanId) {
    query.where("TINGKATAN_ID", tingkatanId);
  } else {
    query.whereNull("TINGKATAN_ID");
  }

  return query.first();
};