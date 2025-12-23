import { db } from "../core/config/knex.js";

const TABLE_NAME = "master_informasi";

export const getAllInfoSekolah = async () => {
  return await db(TABLE_NAME)
    .select("*")
    .orderBy("TANGGAL", "desc");
};

export const getInfoSekolahById = async (id) => {
  return await db(TABLE_NAME)
    .where({ ID: id })
    .first();
};

export const createInfoSekolah = async (data) => {
  const [id] = await db(TABLE_NAME).insert({
    JUDUL: data.JUDUL,
    DESKRIPSI: data.DESKRIPSI,
    KATEGORI: data.KATEGORI,
    TANGGAL: data.TANGGAL,
  });
  return getInfoSekolahById(id);
};

export const updateInfoSekolah = async (id, data) => {
  await db(TABLE_NAME)
    .where({ ID: id })
    .update({
      JUDUL: data.JUDUL,
      DESKRIPSI: data.DESKRIPSI,
      KATEGORI: data.KATEGORI,
      TANGGAL: data.TANGGAL,
      updated_at: db.fn.now(),
    });
  return getInfoSekolahById(id);
};

export const deleteInfoSekolah = async (id) => {
  return await db(TABLE_NAME)
    .where({ ID: id })
    .del();
};