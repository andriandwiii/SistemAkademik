import { db } from "../core/config/knex.js";

/**
 * Get all kelas (JOIN master_gedung & master_ruang)
 **/
export const getAllKelas = async () => {
  return db("master_kelas as k")
    .leftJoin("master_gedung as g", "k.GEDUNG_ID", "g.GEDUNG_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "k.ID",
      "k.KELAS_ID",
      "k.GEDUNG_ID",
      "g.NAMA_GEDUNG",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "k.STATUS",
      "k.created_at",
      "k.updated_at"
    )
    .orderBy("k.ID", "asc");
};

/**
 * Get kelas by ID (Primary Key)
 **/
export const getKelasById = async (id) => {
  return db("master_kelas as k")
    .leftJoin("master_gedung as g", "k.GEDUNG_ID", "g.GEDUNG_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "k.ID",
      "k.KELAS_ID",
      "k.GEDUNG_ID",
      "g.NAMA_GEDUNG",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "k.STATUS",
      "k.created_at",
      "k.updated_at"
    )
    .where("k.ID", id)
    .first();
};

/**
 * Get kelas by KELAS_ID (kode unik)
 **/
export const getKelasByKode = async (kode) => {
  return db("master_kelas as k")
    .leftJoin("master_gedung as g", "k.GEDUNG_ID", "g.GEDUNG_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "k.ID",
      "k.KELAS_ID",
      "k.GEDUNG_ID",
      "g.NAMA_GEDUNG",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "k.STATUS",
      "k.created_at",
      "k.updated_at"
    )
    .where("k.KELAS_ID", kode)
    .first();
};

/**
 * Ambil kelas terakhir (untuk auto-generate KELAS_ID)
 **/
export const getLastKelas = async () => {
  return db("master_kelas").orderBy("KELAS_ID", "desc").first();
};

/**
 * Create new kelas
 **/
export const createKelas = async ({ KELAS_ID, GEDUNG_ID, RUANG_ID, STATUS }) => {
  if (!GEDUNG_ID || !RUANG_ID) {
    throw new Error("GEDUNG_ID dan RUANG_ID wajib diisi");
  }

  const [id] = await db("master_kelas").insert({
    KELAS_ID,
    GEDUNG_ID,
    RUANG_ID,
    STATUS: STATUS || "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return getKelasById(id);
};

/**
 * Update kelas
 **/
export const updateKelas = async (id, { KELAS_ID, GEDUNG_ID, RUANG_ID, STATUS }) => {
  const dataToUpdate = {
    GEDUNG_ID,
    RUANG_ID,
    STATUS,
    updated_at: db.fn.now(),
  };

  if (KELAS_ID) dataToUpdate.KELAS_ID = KELAS_ID;

  await db("master_kelas").where({ id }).update(dataToUpdate);

  return getKelasById(id);
};

/**
 * Delete kelas
 **/
export const deleteKelas = async (id) => {
  return db("master_kelas").where({ id }).del();
};
