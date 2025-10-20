import { db } from "../core/config/knex.js";

/**
 * Get all waktu pelajaran
 **/
export const getAllWaktuPelajaran = async () => db("master_waktu_pelajaran").select("*");

/**
 * Get waktu pelajaran by ID
 **/
export const getWaktuPelajaranById = async (id) =>
  db("master_waktu_pelajaran").where({ ID: id }).first();

/**
 * Get waktu pelajaran by mata pelajaran
 **/
export const getWaktuPelajaranByMapel = async (mata_pelajaran) =>
  db("master_waktu_pelajaran").where({ MATA_PELAJARAN: mata_pelajaran }).first();

/**
 * Create new waktu pelajaran
 **/
export const createWaktuPelajaran = async ({
  HARI,
  JAM_MULAI,
  JAM_SELESAI,
  DURASI,
  MATA_PELAJARAN,
  KELAS,
  RUANGAN,
  GURU_PENGAJAR,
  STATUS,
}) => {
  if (!HARI || !JAM_MULAI || !MATA_PELAJARAN || !KELAS || !RUANGAN || !GURU_PENGAJAR) {
    throw new Error("HARI, JAM_MULAI, MATA_PELAJARAN, KELAS, RUANGAN, dan GURU_PENGAJAR wajib diisi");
  }

  const [id] = await db("master_waktu_pelajaran").insert({
    HARI,
    JAM_MULAI,
    JAM_SELESAI,
    DURASI,
    MATA_PELAJARAN,
    KELAS,
    RUANGAN,
    GURU_PENGAJAR,
    STATUS,
  });
  return db("master_waktu_pelajaran").where({ ID: id }).first();
};

/**
 * Update waktu pelajaran
 **/
export const updateWaktuPelajaran = async (
  id,
  { HARI, JAM_MULAI, JAM_SELESAI, DURASI, MATA_PELAJARAN, KELAS, RUANGAN, GURU_PENGAJAR, STATUS }
) => {
  if (!HARI || !JAM_MULAI || !MATA_PELAJARAN || !KELAS || !RUANGAN || !GURU_PENGAJAR) {
    throw new Error("HARI, JAM_MULAI, MATA_PELAJARAN, KELAS, RUANGAN, dan GURU_PENGAJAR wajib diisi");
  }

  await db("master_waktu_pelajaran")
    .where({ ID: id })
    .update({ HARI, JAM_MULAI, JAM_SELESAI, DURASI, MATA_PELAJARAN, KELAS, RUANGAN, GURU_PENGAJAR, STATUS });
  return db("master_waktu_pelajaran").where({ ID: id }).first();
};

/**
 * Delete waktu pelajaran
 **/
export const deleteWaktuPelajaran = async (id) =>
  db("master_waktu_pelajaran").where({ ID: id }).del();
