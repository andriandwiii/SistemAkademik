import { db } from "../core/config/knex.js";

const table = "master_jadwal";

// Format data hasil query
const formatRow = (r) => ({
  ID: r.ID,
  KODE_JADWAL: r.KODE_JADWAL,
  hari: {
    HARI: r.HARI,
  },
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
    GEDUNG_ID: r.GEDUNG_ID,
    RUANG_ID: r.RUANG_ID,
    NAMA_RUANG: r.NAMA_RUANG,
  },
  guru: {
    NIP: r.NIP,
    NAMA_GURU: r.NAMA_GURU,
  },
  mata_pelajaran: {
    KODE_MAPEL: r.KODE_MAPEL,
    NAMA_MAPEL: r.NAMA_MAPEL,
  },
  jam_pelajaran: {
    KODE_JP: r.KODE_JP,
    JP_KE: r.JP_KE,
    WAKTU_MULAI: r.WAKTU_MULAI,
    WAKTU_SELESAI: r.WAKTU_SELESAI,
  },
  created_at: r.created_at,
  updated_at: r.updated_at,
});

// Query join antar tabel utama
const baseQuery = () =>
  db(`${table} as j`)
    .select(
      "j.*",
      "ti.TINGKATAN",
      "ju.NAMA_JURUSAN",
      "k.GEDUNG_ID",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "g.NAMA as NAMA_GURU",
      "mp.NAMA_MAPEL",
      "jp.JP_KE",
      "jp.WAKTU_MULAI",
      "jp.WAKTU_SELESAI"
    )
    .leftJoin("master_hari as h", "j.HARI", "h.NAMA_HARI")
    .leftJoin("master_tingkatan as ti", "j.TINGKATAN_ID", "ti.TINGKATAN_ID")
    .leftJoin("master_jurusan as ju", "j.JURUSAN_ID", "ju.JURUSAN_ID")
    .leftJoin("master_kelas as k", "j.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .leftJoin("master_guru as g", "j.NIP", "g.NIP")
    .leftJoin("master_mata_pelajaran as mp", "j.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_jam_pelajaran as jp", "j.KODE_JP", "jp.KODE_JP");

// Ambil semua jadwal
export const getAllJadwal = async () => {
  const rows = await baseQuery().orderBy("j.ID", "desc");
  return rows.map(formatRow);
};

// Tambah jadwal baru (KODE_JADWAL generate otomatis)
export const createJadwal = async (data) => {
  // 🔹 Ambil jadwal terakhir untuk generate kode berikutnya
  const last = await db(table).select("KODE_JADWAL").orderBy("ID", "desc").first();

  let nextNumber = 1;
  if (last && last.KODE_JADWAL) {
    const numericPart = parseInt(last.KODE_JADWAL.replace("JDW", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }

  // 🔹 Format: JDW + angka 3 digit
  const newKode = `JDW${nextNumber.toString().padStart(3, "0")}`;

  const insertData = {
    ...data,
    KODE_JADWAL: newKode, // otomatis
  };

  const [id] = await db(table).insert(insertData);
  const row = await baseQuery().where("j.ID", id).first();
  return formatRow(row);
};

// Update jadwal
export const updateJadwal = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where("j.ID", id).first();
  return formatRow(row);
};

// Hapus jadwal
export const deleteJadwal = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};