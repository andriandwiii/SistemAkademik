import { db } from "../core/config/knex.js";

const table = "transaksi_kkm";

/* ===========================================================
 * FORMAT DATA (FINAL - FIXED KODE_KKM)
 * ===========================================================
 */
const formatRow = (r) => ({
  ID: r.ID,
  TRANSAKSI_ID: r.TRANSAKSI_ID,

  tingkatan: {
    TINGKATAN_ID: r.TINGKATAN_ID,
    TINGKATAN: r.TINGKATAN,
  },

  jurusan: {
    JURUSAN_ID: r.JURUSAN_ID,
    NAMA_JURUSAN: r.NAMA_JURUSAN,
  },

  kelas: {
    KELAS_ID: r.KELAS_ID,
    NAMA_KELAS: r.NAMA_KELAS,
  },

  mapel: {
    KODE_MAPEL: r.KODE_MAPEL,
    NAMA_MAPEL: r.NAMA_MAPEL,
  },

  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN,
  },

  kkm: {
    KODE_KKM: r.KODE_KKM, // Menggunakan KODE_KKM
    NILAI_KKM: r.NILAI_KKM,
  },

  created_at: r.created_at,
  updated_at: r.updated_at,
});

/* ===========================================================
 * BASE QUERY (FINAL FIX - JOIN BY KODE_KKM)
 * ===========================================================
 */
const baseQuery = () =>
  db(`${table} as t`)
    .select(
      "t.*",
      "ti.TINGKATAN",
      "j.NAMA_JURUSAN",

      // karena master_kelas tidak punya NAMA_KELAS
      "k.KELAS_ID as NAMA_KELAS",

      "m.NAMA_MAPEL",

      // FIX UTAMA: diambil dari TAHUN_AJARAN_ID
      "ta.TAHUN_AJARAN_ID as TAHUN_AJARAN",

      // Ambil NILAI KKM dari tabel master_kkm
      // Asumsi: kolom nilai di master_kkm bernama "KKM" atau "NILAI_KKM"
      // Sesuaikan 'kkm.KKM' dengan nama kolom asli di database Anda
      db.raw("kkm.KKM as NILAI_KKM") 
    )
    .leftJoin("master_tingkatan as ti", "t.TINGKATAN_ID", "ti.TINGKATAN_ID")
    .leftJoin("master_jurusan as j", "t.JURUSAN_ID", "j.JURUSAN_ID")
    .leftJoin("master_kelas as k", "t.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_mata_pelajaran as m", "t.KODE_MAPEL", "m.KODE_MAPEL")
    .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    // UBAH JOIN: Menggunakan KODE_KKM
    .leftJoin("master_kkm as kkm", "t.KODE_KKM", "kkm.KODE_KKM");

/* ===========================================================
 * GET MASTER KKM
 * ===========================================================
 */
export const findKkmByKodeMapel = async (KODE_MAPEL) => {
  return await db("master_kkm").where({ KODE_MAPEL }).first();
};

/* ===========================================================
 * GET ALL
 * ===========================================================
 */
export const getAllTransaksiKkm = async () => {
  const rows = await baseQuery().orderBy("t.ID", "desc");
  return rows.map(formatRow);
};

/* ===========================================================
 * CREATE
 * ===========================================================
 */
export const createTransaksiKkm = async (data) => {
  // 1. Cari Data Master KKM berdasarkan Mapel
  const kkmRow = await findKkmByKodeMapel(data.KODE_MAPEL);
  
  if (!kkmRow) {
    throw new Error(`Mapel ${data.KODE_MAPEL} tidak memiliki Master KKM`);
  }

  // 2. Generate ID Transaksi
  const last = await db(table).select("TRANSAKSI_ID").orderBy("ID", "desc").first();
  let nextNumber = last?.TRANSAKSI_ID
    ? parseInt(last.TRANSAKSI_ID.replace("TRXK", ""), 10) + 1
    : 1;
  const newId = `TRXK${nextNumber.toString().padStart(6, "0")}`;

  // 3. Siapkan Data Insert (Pakai KODE_KKM)
  const insertData = {
    ...data,
    KODE_KKM: kkmRow.KODE_KKM, // Ambil KODE dari master_kkm
    TRANSAKSI_ID: newId,
  };

  // Hapus properti KKM_ID jika ada di payload 'data' agar tidak error
  delete insertData.KKM_ID;

  const [id] = await db(table).insert(insertData);

  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};

/* ===========================================================
 * UPDATE
 * ===========================================================
 */
export const updateTransaksiKkm = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  // Cek ulang KKM jika mapel berubah (atau sekadar memastikan konsistensi)
  const kkmRow = await findKkmByKodeMapel(data.KODE_MAPEL);
  if (!kkmRow) {
    throw new Error(`Mapel ${data.KODE_MAPEL} tidak memiliki Master KKM`);
  }

  // Update Data (Pakai KODE_KKM)
  const updatePayload = {
      ...data,
      KODE_KKM: kkmRow.KODE_KKM,
  };
  
  // Hapus properti KKM_ID jika ada di payload 'data'
  delete updatePayload.KKM_ID;

  await db(table).where({ ID: id }).update(updatePayload);

  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};

/* ===========================================================
 * DELETE
 * ===========================================================
 */
export const deleteTransaksiKkm = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};