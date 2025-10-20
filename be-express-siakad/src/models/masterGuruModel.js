import { db } from "../core/config/knex.js";
/**
 * Get all guru
 **/
export const getAllGuru = async () => db("master_guru").select("*");

/**
 * Get guru by ID
 **/
export const getGuruById = async (id) =>
  db("master_guru").where({ GURU_ID: id }).first();

/**
 * Get guru by NIP
 **/
export const getGuruByNip = async (nip) =>
  db("master_guru").where({ NIP: nip }).first();

/**
 * Create new guru
 **/
export const createGuru = async ({
  NIP,
  NAMA,
  GELAR,
  PANGKAT,
  JABATAN,
}) => {
  const [id] = await db("master_guru").insert({
    NIP,
    NAMA,
    GELAR,
    PANGKAT,
    JABATAN,
  });
  return db("master_guru").where({ GURU_ID: id }).first();
};

/**
 * Update guru
 **/
export const updateGuru = async (
  id,
  { NIP, NAMA, GELAR, PANGKAT, JABATAN }
) => {
  await db("master_guru")
    .where({ GURU_ID: id })
    .update({ NIP, NAMA, GELAR, PANGKAT, JABATAN });
  return db("master_guru").where({ GURU_ID: id }).first();
};

/**
 * Delete guru
 **/
export const deleteGuru = async (id) =>
db("master_guru").where({ GURU_ID: id }).del();
