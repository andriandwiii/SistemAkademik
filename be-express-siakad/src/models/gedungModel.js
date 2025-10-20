import { db } from "../core/config/knex.js";

const GedungTable = "master_gedung";

// Ambil semua gedung
export const getAllGedung = async () => {
  return db(GedungTable).select("*").orderBy("GEDUNG_ID", "asc");
};

// Ambil gedung berdasarkan ID
export const getGedungById = async (id) => {
  return db(GedungTable).where({ GEDUNG_ID: id }).first();
};

// Buat gedung baru
export const createGedung = async (data) => {
  const [id] = await db(GedungTable).insert({
    NAMA_GEDUNG: data.NAMA_GEDUNG,
    LOKASI: data.LOKASI,
  });
  return db(GedungTable).where({ GEDUNG_ID: id }).first();
};

// Update gedung
export const updateGedung = async (id, data) => {
  const result = await db(GedungTable)
    .where({ GEDUNG_ID: id })
    .update({ NAMA_GEDUNG: data.NAMA_GEDUNG, LOKASI: data.LOKASI, updated_at: db.fn.now() });

  if (result) {
    return db(GedungTable).where({ GEDUNG_ID: id }).first();
  }
  return null;
};

// Hapus gedung
export const deleteGedung = async (id) => {
  const gedung = await db(GedungTable).where({ GEDUNG_ID: id }).first();
  if (!gedung) return null;

  await db(GedungTable).where({ GEDUNG_ID: id }).del();
  return gedung;
};
