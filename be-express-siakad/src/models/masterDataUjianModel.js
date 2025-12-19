// src/models/masterDataUjianModel.js
import { db } from "../core/config/knex.js";

/** GET semua ujian */
export const getAllUjian = async () => db("master_ujian").select("*");

/** GET ujian by ID */
export const getUjianById = async (id) =>
  db("master_ujian").where({ ID: id }).first();

/** GET ujian by KODE_UJIAN */
export const getUjianByKode = async (kode) =>
  db("master_ujian").where({ KODE_UJIAN: kode }).first();

/** GET jenis ujian by KODE_UJIAN (relasi) */
export const getJenisUjianByKode = async (kode) =>
  db("master_jenis_ujian").where({ KODE_UJIAN: kode }).first();

/** CREATE ujian baru */
export const addUjian = async ({
  KODE_UJIAN,
  METODE,
  DURASI,
  ACAK_SOAL,
  ACAK_JAWABAN,
  STATUS,
}) => {
  if (!KODE_UJIAN) throw new Error("KODE_UJIAN wajib diisi");

  const [id] = await db("master_ujian").insert({
    KODE_UJIAN,
    METODE,
    DURASI,
    ACAK_SOAL,
    ACAK_JAWABAN,
    STATUS,
  });

  return db("master_ujian").where({ ID: id }).first();
};

/** UPDATE ujian */
export const updateUjian = async (
  id,
  { METODE, DURASI, ACAK_SOAL, ACAK_JAWABAN, STATUS }
) => {
  await db("master_ujian")
    .where({ ID: id })
    .update({ METODE, DURASI, ACAK_SOAL, ACAK_JAWABAN, STATUS });

  return db("master_ujian").where({ ID: id }).first();
};

/** DELETE ujian */
export const deleteUjian = async (id) =>
  db("master_ujian").where({ ID: id }).del();
