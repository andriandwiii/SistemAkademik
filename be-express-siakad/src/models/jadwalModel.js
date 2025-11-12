import { db } from "../core/config/knex.js";

const table = "master_jadwal";

// =============================================================
// 🔹 Format hasil query
// =============================================================
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
  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN,
  },
  created_at: r.created_at,
  updated_at: r.updated_at,
});

// =============================================================
// 🔹 Query join antar tabel utama
// =============================================================
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
      "jp.WAKTU_SELESAI",
      "ta.NAMA_TAHUN_AJARAN"
    )
    .leftJoin("master_hari as h", "j.HARI", "h.NAMA_HARI")
    .leftJoin("master_tingkatan as ti", "j.TINGKATAN_ID", "ti.TINGKATAN_ID")
    .leftJoin("master_jurusan as ju", "j.JURUSAN_ID", "ju.JURUSAN_ID")
    .leftJoin("master_kelas as k", "j.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .leftJoin("master_guru as g", "j.NIP", "g.NIP")
    .leftJoin("master_mata_pelajaran as mp", "j.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_jam_pelajaran as jp", "j.KODE_JP", "jp.KODE_JP")
    .leftJoin("master_tahun_ajaran as ta", "j.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID");

// =============================================================
// 🔹 AMBIL SEMUA JADWAL (Hanya Tahun Ajaran Aktif)
// =============================================================
export const getAllJadwal = async () => {
  const daftarTA = await db("master_tahun_ajaran")
    .where("STATUS", "Aktif")
    .select("TAHUN_AJARAN_ID");

  const daftarID_TA = daftarTA.map((ta) => ta.TAHUN_AJARAN_ID);

  if (!daftarID_TA || daftarID_TA.length === 0) {
    console.warn("⚠️ Tidak ada Tahun Ajaran Aktif ditemukan di database.");
    return [];
  }

  const rows = await baseQuery()
    .whereIn("j.TAHUN_AJARAN_ID", daftarID_TA)
    .orderBy("j.ID", "desc");

  return rows.map(formatRow);
};

// =============================================================
// 🔹 TAMBAH JADWAL BARU
// =============================================================
export const createJadwal = async (data) => {
  const last = await db(table).select("KODE_JADWAL").orderBy("ID", "desc").first();

  let nextNumber = 1;
  if (last && last.KODE_JADWAL) {
    const numericPart = parseInt(last.KODE_JADWAL.replace("JDW", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }

  const newKode = `JDW${nextNumber.toString().padStart(3, "0")}`;

  const insertData = {
    ...data,
    KODE_JADWAL: newKode,
  };

  const [id] = await db(table).insert(insertData);
  const row = await baseQuery().where("j.ID", id).first();
  return formatRow(row);
};

// =============================================================
// 🔹 UPDATE JADWAL
// =============================================================
export const updateJadwal = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where("j.ID", id).first();
  return formatRow(row);
};

// =============================================================
// 🔹 HAPUS JADWAL
// =============================================================
export const deleteJadwal = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};

// =============================================================
// 🔹 CEK BENTROK JADWAL (Guru / Kelas + Tahun Ajaran)
// =============================================================
export const checkBentrok = async (data) => {
  const {
    HARI,
    KODE_JP,
    NIP,
    KELAS_ID,
    TAHUN_AJARAN_ID,
    excludeId = null,
  } = data;

  try {
    const query = db(table)
      .select("ID", "NIP", "KELAS_ID", "TAHUN_AJARAN_ID")
      .where({
        HARI,
        KODE_JP,
        TAHUN_AJARAN_ID, // ✅ Pastikan hanya dicek di tahun ajaran yang sama
      })
      .andWhere(function () {
        this.where({ NIP }).orWhere({ KELAS_ID });
      });

    if (excludeId) {
      query.andWhere("ID", "!=", excludeId);
    }

    const row = await query.first();
    return row || null;
  } catch (err) {
    console.error("❌ Error checkBentrok Model:", err);
    throw new Error(err.message || "Gagal melakukan pengecekan bentrok di model");
  }
};
