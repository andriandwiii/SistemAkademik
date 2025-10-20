import { db } from "../core/config/knex.js";

const table = "master_aset_sekolah";

// Ambil semua aset
export const getAllAset = async () => {
  const rows = await db(table)
    .select(
      `${table}.*`,
      "master_gedung.NAMA_GEDUNG",
      "master_gedung.GEDUNG_ID"
    )
    .leftJoin("master_gedung", `${table}.GEDUNG_ID`, "master_gedung.GEDUNG_ID")
    .orderBy(`${table}.ASET_ID`, "desc");

  // Buat nested object untuk frontend
  return rows.map((r) => ({
    ...r,
    gedung: {
      GEDUNG_ID: r.GEDUNG_ID,
      NAMA_GEDUNG: r.NAMA_GEDUNG,
    },
  }));
};

// Tambah aset baru
export const createAset = async (data) => {
  const [id] = await db(table).insert(data);
  return db(table).where({ ASET_ID: id }).first();
};

// Update aset
export const updateAset = async (id, data) => {
  const aset = await db(table).where({ ASET_ID: id }).first();
  if (!aset) return null;
  await db(table).where({ ASET_ID: id }).update(data);
  return db(table).where({ ASET_ID: id }).first();
};

// Hapus aset
export const deleteAset = async (id) => {
  const aset = await db(table).where({ ASET_ID: id }).first();
  if (!aset) return null;
  await db(table).where({ ASET_ID: id }).del();
  return aset;
};

// Ambil aset by ID
export const getAsetById = async (id) => {
  const aset = await db(table)
    .select(
      `${table}.*`,
      "master_gedung.NAMA_GEDUNG",
      "master_gedung.GEDUNG_ID"
    )
    .leftJoin("master_gedung", `${table}.GEDUNG_ID`, "master_gedung.GEDUNG_ID")
    .where(`${table}.ASET_ID`, id)
    .first();

  if (!aset) return null;

  return {
    ...aset,
    gedung: {
      GEDUNG_ID: aset.GEDUNG_ID,
      NAMA_GEDUNG: aset.NAMA_GEDUNG,
    },
  };
};
