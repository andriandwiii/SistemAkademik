import { db } from "../core/config/knex.js";

/**
 * Get all jam pelajaran
 **/
export const getAllJamPelajaran = async () => {
  return db("master_jam_pelajaran").select("*").orderBy("JP_KE", "asc");
};

/**
 * Get jam pelajaran by ID
 **/
export const getJamPelajaranById = async (ID) => {
  return db("master_jam_pelajaran").where("ID", ID).first();
};

/**
 * Get jam pelajaran by KODE_JP
 **/
export const getJamPelajaranByKode = async (KODE_JP) => {
  return db("master_jam_pelajaran").where("KODE_JP", KODE_JP).first();
};

/**
 * Ambil jam pelajaran terakhir
 **/
export const getLastJamPelajaran = async () => {
  return db("master_jam_pelajaran").orderBy("KODE_JP", "desc").first();
};

/**
 * Create jam pelajaran baru
 **/
export const createJamPelajaran = async ({
  KODE_JP,
  JP_KE,
  WAKTU_MULAI,
  WAKTU_SELESAI,
  DURASI,
  DESKRIPSI,
}) => {
  if (!KODE_JP || !WAKTU_MULAI || !WAKTU_SELESAI) {
    throw new Error("KODE_JP, WAKTU_MULAI, dan WAKTU_SELESAI wajib diisi");
  }

  const [insertedID] = await db("master_jam_pelajaran").insert({
    KODE_JP,
    JP_KE,
    WAKTU_MULAI,
    WAKTU_SELESAI,
    DURASI: DURASI || 45,
    DESKRIPSI: DESKRIPSI || "Pelajaran",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_jam_pelajaran").where("ID", insertedID).first();
};

/**
 * Update jam pelajaran
 **/
export const updateJamPelajaran = async (
  ID,
  { KODE_JP, JP_KE, WAKTU_MULAI, WAKTU_SELESAI, DURASI, DESKRIPSI }
) => {
  const dataToUpdate = {
    JP_KE,
    WAKTU_MULAI,
    WAKTU_SELESAI,
    DURASI,
    DESKRIPSI,
    updated_at: db.fn.now(),
  };

  if (KODE_JP) dataToUpdate.KODE_JP = KODE_JP;

  await db("master_jam_pelajaran").where("ID", ID).update(dataToUpdate);

  return db("master_jam_pelajaran").where("ID", ID).first();
};

/**
 * Delete jam pelajaran
 **/
export const deleteJamPelajaran = async (ID) => {
  return db("master_jam_pelajaran").where("ID", ID).del();
};
