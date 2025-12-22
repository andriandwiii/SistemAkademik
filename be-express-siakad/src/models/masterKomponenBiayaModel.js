import { db } from "../core/config/knex.js";

const table = "master_komponen_biaya";

/**
 * Get all komponen biaya
 */
export const getAllKomponen = async (jenisBiaya = null) => {
  const query = db(table).where("STATUS", "Aktif");
  
  if (jenisBiaya) {
    query.where("JENIS_BIAYA", jenisBiaya);
  }
  
  return query.orderBy("URUTAN");
};

/**
 * Get komponen by ID
 */
export const getKomponenById = async (komponenId) => {
  return db(table).where("KOMPONEN_ID", komponenId).first();
};

/**
 * Create new komponen
 */
export const createKomponen = async (data) => {
  // Generate KOMPONEN_ID
  const last = await db(table)
    .select("KOMPONEN_ID")
    .orderBy("id", "desc")
    .first();

  let nextNumber = 1;
  if (last && last.KOMPONEN_ID) {
    const numericPart = parseInt(last.KOMPONEN_ID.replace("KOMP", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }
  const komponenId = `KOMP${nextNumber.toString().padStart(3, "0")}`;

  const [id] = await db(table).insert({
    ...data,
    KOMPONEN_ID: komponenId
  });
  
  return db(table).where("id", id).first();
};

/**
 * Update komponen
 */
export const updateKomponen = async (komponenId, data) => {
  await db(table).where("KOMPONEN_ID", komponenId).update(data);
  return db(table).where("KOMPONEN_ID", komponenId).first();
};

/**
 * Delete komponen (soft delete)
 */
export const deleteKomponen = async (komponenId) => {
  await db(table).where("KOMPONEN_ID", komponenId).update({ STATUS: "Tidak Aktif" });
  return db(table).where("KOMPONEN_ID", komponenId).first();
};

/**
 * Hard delete komponen
 */
export const hardDeleteKomponen = async (komponenId) => {
  const komponen = await db(table).where("KOMPONEN_ID", komponenId).first();
  if (!komponen) return null;
  
  await db(table).where("KOMPONEN_ID", komponenId).del();
  return komponen;
};

/**
 * Get komponen SPP
 */
export const getKomponenSPP = async () => {
  return db(table)
    .where("JENIS_BIAYA", "RUTIN")
    .where("STATUS", "Aktif")
    .orderBy("URUTAN")
    .first();
};