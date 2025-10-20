import { db } from "../core/config/knex.js";

const table = "transaksi_siswa_kelas";

// Helper untuk format row agar konsisten
const formatRow = (r) => ({
  ID: r.ID,
  TAHUN_AJARAN: r.TAHUN_AJARAN,
  STATUS: r.STATUS,
  siswa: {
    SISWA_ID: r.SISWA_ID,
    NAMA: r.NAMA_SISWA,
    NIS: r.NIS_SISWA,
  },
  kelas: {
    KELAS_ID: r.KELAS_ID,
    NAMA_JURUSAN: r.NAMA_JURUSAN,
    TINGKATAN: r.TINGKATAN,
    NAMA_RUANG: r.NAMA_RUANG,
    fullName: `${r.TINGKATAN || ""} ${r.NAMA_JURUSAN || ""} ${r.NAMA_RUANG || ""}`.trim(),
  },
});

// Query base join
const baseQuery = () =>
  db(table)
    .select(
      `${table}.*`,
      "m_siswa.NAMA as NAMA_SISWA",
      "m_siswa.NIS as NIS_SISWA",
      "m_kelas.KELAS_ID",
      "m_kelas.RUANG_ID",
      "master_tingkatan.TINGKATAN",
      "master_jurusan.NAMA_JURUSAN",
      "master_ruang_kelas.NAMA_RUANG" // ambil dari tabel master_ruang_kelas
    )
    .leftJoin("m_siswa", `${table}.SISWA_ID`, "m_siswa.SISWA_ID")
    .leftJoin("m_kelas", `${table}.KELAS_ID`, "m_kelas.KELAS_ID")
    .leftJoin("master_tingkatan", "m_kelas.TINGKATAN_ID", "master_tingkatan.TINGKATAN_ID")
    .leftJoin("master_jurusan", "m_kelas.JURUSAN_ID", "master_jurusan.JURUSAN_ID")
    .leftJoin("master_ruang_kelas", "m_kelas.RUANG_ID", "master_ruang_kelas.RUANG_ID");

// Ambil semua transaksi siswa
export const getAllTransaksi = async () => {
  const rows = await baseQuery().orderBy(`${table}.ID`, "desc");
  return rows.map(formatRow);
};

// Tambah siswa ke kelas
export const createTransaksi = async (data) => {
  const [id] = await db(table).insert(data);
  const row = await baseQuery().where(`${table}.ID`, id).first();
  return formatRow(row);
};

// Update transaksi
export const updateTransaksi = async (id, data) => {
  const trx = await db(table).where({ ID: id }).first();
  if (!trx) return null;
  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where({ ID: id }).first();
  return formatRow(row);
};

// Hapus transaksi
export const deleteTransaksi = async (id) => {
  const trx = await db(table).where({ ID: id }).first();
  if (!trx) return null;
  await db(table).where({ ID: id }).del();
  return trx;
};
