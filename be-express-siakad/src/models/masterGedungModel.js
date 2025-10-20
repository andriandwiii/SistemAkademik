import { db } from "../core/config/knex.js";

/**
 * Ambil semua data gedung
 */
export const getAllGedung = async () => {
  return db("master_gedung").select("*").orderBy("GEDUNG_ID", "asc");
};

/**
 * Ambil gedung berdasarkan ID
 */
export const getGedungById = async (id) => {
  return db("master_gedung").where({ GEDUNG_ID: id }).first();
};

/**
 * Ambil gedung berdasarkan kode
 */
export const getGedungByKode = async (kode) => {
  return db("master_gedung").where({ KODE_GEDUNG: kode }).first();
};

/**
 * Tambah data gedung baru
 */
export const createGedung = async (data) => {
  const {
    KODE_GEDUNG,
    NAMA_GEDUNG,
    JUMLAH_LANTAI,
    KAPASITAS,
    KONDISI,
    TAHUN_DIBANGUN,
    LUAS_BANGUNAN,
    LETAK,
    KETERANGAN,
    STATUS = "Aktif",
  } = data;

  const [id] = await db("master_gedung").insert({
    KODE_GEDUNG,
    NAMA_GEDUNG,
    JUMLAH_LANTAI: JUMLAH_LANTAI ?? 1,
    KAPASITAS: KAPASITAS ?? 0,
    KONDISI: KONDISI ?? "Baik",
    TAHUN_DIBANGUN: TAHUN_DIBANGUN ?? null,
    LUAS_BANGUNAN: LUAS_BANGUNAN ?? null,
    LETAK: LETAK ?? null,
    KETERANGAN: KETERANGAN ?? null,
    STATUS: STATUS === "Tidak Aktif" ? "Tidak Aktif" : "Aktif",
    CREATED_AT: db.fn.now(),
    UPDATED_AT: db.fn.now(),
  });

  return db("master_gedung").where({ GEDUNG_ID: id }).first();
};

/**
 * Update data gedung
 */
export const updateGedung = async (id, data) => {
  const {
    KODE_GEDUNG,
    NAMA_GEDUNG,
    JUMLAH_LANTAI,
    KAPASITAS,
    KONDISI,
    TAHUN_DIBANGUN,
    LUAS_BANGUNAN,
    LETAK,
    KETERANGAN,
    STATUS,
  } = data;

  await db("master_gedung")
    .where({ GEDUNG_ID: id })
    .update({
      KODE_GEDUNG,
      NAMA_GEDUNG,
      JUMLAH_LANTAI,
      KAPASITAS,
      KONDISI,
      TAHUN_DIBANGUN,
      LUAS_BANGUNAN,
      LETAK,
      KETERANGAN,
      STATUS: STATUS === "Tidak Aktif" ? "Tidak Aktif" : "Aktif",
      UPDATED_AT: db.fn.now(),
    });

  return db("master_gedung").where({ GEDUNG_ID: id }).first();
};

/**
 * Hapus data gedung
 */
export const deleteGedung = async (id) => {
  return db("master_gedung").where({ GEDUNG_ID: id }).del();
};
