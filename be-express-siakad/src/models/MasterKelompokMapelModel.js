import { db } from "../core/config/knex.js";

/** 🔹 Ambil semua data Kelompok Mapel */
export const getAllKelompokMapel = async () => {
  return db("master_kelompok_mapel")
    .select(
      "ID",
      "KELOMPOK",
      "NAMA_KELOMPOK",
      "STATUS",
      "created_at",
      "updated_at"
    )
    .orderBy("ID", "asc");
};

/** 🔹 Ambil satu data Kelompok Mapel berdasarkan ID */
export const getKelompokMapelById = async (id) => {
  return db("master_kelompok_mapel")
    .where("ID", id)
    .first();
};

/** 🔹 Cek duplikat Kelompok (berdasarkan huruf Kelompok, misal 'A') */
export const checkDuplicateKelompok = async (KELOMPOK) => {
  return db("master_kelompok_mapel")
    .where({ KELOMPOK })
    .first();
};

/** 🔹 Cek duplikat Kelompok kecuali ID tertentu (untuk update) */
export const checkDuplicateExcept = async (KELOMPOK, excludeId) => {
  return db("master_kelompok_mapel")
    .where({ KELOMPOK })
    .whereNot("ID", excludeId)
    .first();
};

/** 🔹 Tambah data Kelompok Mapel baru */
export const createKelompokMapel = async (data) => {
  const [insertedId] = await db("master_kelompok_mapel").insert({
    KELOMPOK: data.KELOMPOK,
    NAMA_KELOMPOK: data.NAMA_KELOMPOK,
    STATUS: data.STATUS || "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return getKelompokMapelById(insertedId);
};

/** 🔹 Update data Kelompok Mapel */
export const updateKelompokMapel = async (id, data) => {
  await db("master_kelompok_mapel")
    .where("ID", id)
    .update({
      KELOMPOK: data.KELOMPOK,
      NAMA_KELOMPOK: data.NAMA_KELOMPOK,
      STATUS: data.STATUS,
      updated_at: db.fn.now(),
    });

  return getKelompokMapelById(id);
};

/** 🔹 Hapus data Kelompok Mapel */
export const deleteKelompokMapel = async (id) => {
  return db("master_kelompok_mapel").where("ID", id).del();
};