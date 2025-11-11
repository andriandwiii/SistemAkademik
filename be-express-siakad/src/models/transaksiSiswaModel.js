import { db } from "../core/config/knex.js";

const table = "transaksi_siswa_kelas";

// Format data hasil query (Tidak berubah)
const formatRow = (r) => ({
  ID: r.ID,
  TRANSAKSI_ID: r.TRANSAKSI_ID,
  siswa: {
    NIS: r.NIS,
    NAMA: r.NAMA_SISWA,
    GENDER: r.GENDER,
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

// Query join (Tidak berubah)
const baseQuery = (trx = db) =>
  trx(`${table} as t`)
    .select(
      "t.*",
      "s.NAMA as NAMA_SISWA",
      "s.GENDER",
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

// =================================================================
// VVVV PERUBAHAN DI FUNGSI INI VVVV
// =================================================================

// Ambil semua transaksi
export const getAllTransaksi = async () => {
  // 1. Dapatkan SEMUA ID Tahun Ajaran yang 'Aktif'
  // (Tidak menggunakan .first() lagi)
  const daftarTA = await db("master_tahun_ajaran")
    .where("STATUS", "Aktif")
    .select("TAHUN_AJARAN_ID"); // Hanya ambil ID-nya agar ringan

  // 2. Ubah hasil (array of objects) menjadi array of IDs
  //    Contoh: [{ TAHUN_AJARAN_ID: 1 }, { TAHUN_AJARAN_ID: 3 }]
  //    Menjadi: [1, 3]
  const daftarID_TA = daftarTA.map((ta) => ta.TAHUN_AJARAN_ID);

  // 3. Cek jika tidak ada satupun yang aktif
  if (!daftarID_TA || daftarID_TA.length === 0) {
    console.warn("PERINGATAN: Tidak ada Tahun Ajaran yang 'Aktif' di database.");
    return []; // Kirim array kosong jika tidak ada tahun aktif
  }

  // 4. Ambil transaksi yang ID Tahun Ajarannya ada di dalam daftarID_TA
  const rows = await baseQuery() // <-- baseQuery() otomatis pakai 'db'
    .whereIn("t.TAHUN_AJARAN_ID", daftarID_TA) // <-- GANTI dari .where() menjadi .whereIn()
    .orderBy("t.ID", "desc");

  return rows.map(formatRow);
};

// =================================================================
// ^^^^ PERUBAHAN SELESAI ^^^^
// =================================================================


// Tambah transaksi baru (Tidak berubah)
export const createTransaksi = async (data) => {
  return db.transaction(async (trx) => {
    // 🔹 Ambil transaksi terakhir (di dalam transaksi + dikunci)
    const last = await trx(table)
      .select("TRANSAKSI_ID")
      .orderBy("ID", "desc")
      .first()
      .forUpdate();

    let nextNumber = 1;
    if (last && last.TRANSAKSI_ID) {
      const numericPart = parseInt(last.TRANSAKSI_ID.replace("TRXS", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    const newId = `TRXS${nextNumber.toString().padStart(6, "0")}`;

    // 🔹 Cek duplikat (di dalam transaksi)
    const existing = await trx(table)
      .where({ NIS: data.NIS, TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID })
      .first();
    if (existing) {
      throw new Error("Siswa sudah terdaftar di kelas lain pada tahun ajaran ini.");
    }
    
    const insertData = {
      ...data,
      TRANSAKSI_ID: newId,
    };

    const [id] = await trx(table).insert(insertData);
    
    const row = await baseQuery(trx).where("t.ID", id).first(); 
    return formatRow(row);
  });
};

// Update transaksi (Tidak berubah)
export const updateTransaksi = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};

// Hapus transaksi (Tidak berubah)
export const deleteTransaksi = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};