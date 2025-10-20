import { db } from "../core/config/knex.js";

/**
 * Ambil semua data mapel
 */
export const getAllMapel = async () => {
  return db("m_mapel").select("*").orderBy("MAPEL_ID", "asc");
};

/**
 * Ambil mapel berdasarkan ID
 */
export const getMapelById = async (id) => {
  return db("m_mapel").where({ MAPEL_ID: id }).first();
};

/**
 * Ambil mapel berdasarkan kode
 */
export const getMapelByKode = async (kode) => {
  return db("m_mapel").where({ KODE_MAPEL: kode }).first();
};

/**
 * Tambah mapel baru
 */
export const createMapel = async (data) => {
  const {
    KODE_MAPEL,
    NAMA_MAPEL,
    TINGKAT,
    JURUSAN,
    JUMLAH_JAM,
    KATEGORI,
    KETERANGAN,
    STATUS = "Aktif",
  } = data;

  const [id] = await db("m_mapel").insert({
    KODE_MAPEL,
    NAMA_MAPEL,
    TINGKAT,
    JURUSAN,
    JUMLAH_JAM,
    KATEGORI,
    KETERANGAN: KETERANGAN ?? null,
    STATUS: STATUS === "Tidak Aktif" ? "Tidak Aktif" : "Aktif",
    CREATED_AT: db.fn.now(),
    UPDATED_AT: db.fn.now(),
  });

  return db("m_mapel").where({ MAPEL_ID: id }).first();
};

/**
 * Update mapel
 */
export const updateMapel = async (id, data) => {
  const {
    KODE_MAPEL,
    NAMA_MAPEL,
    TINGKAT,
    JURUSAN,
    JUMLAH_JAM,
    KATEGORI,
    KETERANGAN,
    STATUS,
  } = data;

  await db("m_mapel")
    .where({ MAPEL_ID: id })
    .update({
      KODE_MAPEL,
      NAMA_MAPEL,
      TINGKAT,
      JURUSAN,
      JUMLAH_JAM,
      KATEGORI,
      KETERANGAN: KETERANGAN ?? null,
      STATUS: STATUS === "Tidak Aktif" ? "Tidak Aktif" : "Aktif",
      UPDATED_AT: db.fn.now(),
    });

  return db("m_mapel").where({ MAPEL_ID: id }).first();
};

/**
 * Hapus mapel
 */
export const deleteMapel = async (id) => {
  return db("m_mapel").where({ MAPEL_ID: id }).del();
};
