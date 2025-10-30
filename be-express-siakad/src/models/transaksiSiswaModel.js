import { db } from "../core/config/knex.js";

const table = "transaksi_siswa_kelas";

// Format data hasil query
const formatRow = (r) => ({
  ID: r.ID,
  TRANSAKSI_ID: r.TRANSAKSI_ID,
  siswa: {
    NIS: r.NIS,
    NAMA: r.NAMA_SISWA,
  },
  kelas: {
    KELAS_ID: r.KELAS_ID,
    GEDUNG_ID: r.GEDUNG_ID,
    RUANG_ID: r.RUANG_ID,
    NAMA_RUANG: r.NAMA_RUANG,
   
  },
  jurusan: {
    JURUSAN_ID: r.JURUSAN_ID,
    NAMA_JURUSAN: r.NAMA_JURUSAN,
  },
  tingkatan: {
    TINGKATAN_ID: r.TINGKATAN_ID,
    TINGKATAN: r.TINGKATAN,
  },
  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN,
  },
  created_at: r.created_at,
  updated_at: r.updated_at,
});

// Query join antar tabel utama
const baseQuery = () =>
  db(`${table} as t`)
    .select(
      "t.*",
      "s.NAMA as NAMA_SISWA",
      "ti.TINGKATAN",
      "j.NAMA_JURUSAN",
     
      "k.GEDUNG_ID",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "ta.NAMA_TAHUN_AJARAN"
    )
    .leftJoin("master_siswa as s", "t.NIS", "s.NIS")
    .leftJoin("master_tingkatan as ti", "t.TINGKATAN_ID", "ti.TINGKATAN_ID")
    .leftJoin("master_jurusan as j", "t.JURUSAN_ID", "j.JURUSAN_ID")
    .leftJoin("master_kelas as k", "t.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID");

// Ambil semua transaksi
export const getAllTransaksi = async () => {
  const rows = await baseQuery().orderBy("t.ID", "desc");
  return rows.map(formatRow);
};

// ✅ Tambah transaksi baru (dengan auto generate TRANSAKSI_ID)
export const createTransaksi = async (data) => {
  if (!data.TRANSAKSI_ID) {
    throw new Error("TRANSAKSI_ID harus diisi secara manual dari frontend.");
  }

  const [id] = await db(table).insert(data);
  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};


// Update transaksi
export const updateTransaksi = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};

// Hapus transaksi
export const deleteTransaksi = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};
