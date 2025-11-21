import { db } from "../core/config/knex.js";

const table = "master_predikat";

// Format data hasil query agar rapi (Nested JSON)
const formatRow = (r) => ({
  ID: r.ID,
  KODE_PREDIKAT: r.KODE_PREDIKAT,
  mapel: {
    KODE_MAPEL: r.KODE_MAPEL,
    NAMA_MAPEL: r.NAMA_MAPEL || r.KODE_MAPEL, // Fallback jika nama tidak ketemu
  },
  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN,
  },
  target: {
    TINGKATAN_ID: r.TINGKATAN_ID,
    JURUSAN_ID: r.JURUSAN_ID || null,      // Null jika berlaku umum
    NAMA_JURUSAN: r.NAMA_JURUSAN || "Semua Jurusan",
    KELAS_ID: r.KELAS_ID || null,          // Null jika berlaku umum
  },
  deskripsi: {
    A: r.DESKRIPSI_A,
    B: r.DESKRIPSI_B,
    C: r.DESKRIPSI_C,
    D: r.DESKRIPSI_D,
  },
  created_at: r.created_at,
  updated_at: r.updated_at,
});

// Query join (Digunakan ulang di get, create, update)
const baseQuery = (trx = db) =>
  trx(`${table} as p`)
    .select(
      "p.*",
      "mp.NAMA_MAPEL",
      "ta.NAMA_TAHUN_AJARAN",
      "mj.NAMA_JURUSAN"
      // Tidak perlu join master_kelas/tingkatan jika hanya butuh ID, 
      // tapi kalau mau nama kelas bisa ditambah join ke master_kelas
    )
    .leftJoin("master_mata_pelajaran as mp", "p.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_tahun_ajaran as ta", "p.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .leftJoin("master_jurusan as mj", "p.JURUSAN_ID", "mj.JURUSAN_ID");

// =================================================================
// READ DATA
// =================================================================

// Ambil semua data predikat (Bisa difilter per Tahun Aktif seperti contoh Anda)
export const getAllPredikat = async () => {
  // 1. Dapatkan SEMUA ID Tahun Ajaran yang 'Aktif'
  const daftarTA = await db("master_tahun_ajaran")
    .where("STATUS", "Aktif")
    .select("TAHUN_AJARAN_ID");

  const daftarID_TA = daftarTA.map((ta) => ta.TAHUN_AJARAN_ID);

  // Jika tidak ada tahun aktif, return kosong
  if (!daftarID_TA || daftarID_TA.length === 0) {
    return [];
  }

  // 2. Ambil data predikat berdasarkan Tahun Aktif
  const rows = await baseQuery()
    .whereIn("p.TAHUN_AJARAN_ID", daftarID_TA)
    .orderBy("p.ID", "desc");

  return rows.map(formatRow);
};

// Ambil satu data by ID (Untuk Form Edit)
export const getPredikatById = async (id) => {
  const row = await baseQuery().where("p.ID", id).first();
  return row ? formatRow(row) : null;
};

// =================================================================
// CREATE DATA (Dengan Custom ID & Cek Duplikat)
// =================================================================

export const createPredikat = async (data) => {
  return db.transaction(async (trx) => {
    // 1. Generate Custom ID (Format: PRED-000001)
    const last = await trx(table)
      .select("KODE_PREDIKAT")
      .orderBy("ID", "desc")
      .first()
      .forUpdate(); // Lock row agar aman saat concurrent request

    let nextNumber = 1;
    if (last && last.KODE_PREDIKAT) {
      // Hapus prefix "PRED-" dan ambil angkanya
      const numericPart = parseInt(last.KODE_PREDIKAT.replace("PRED-", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    // PadStart membuat angka 1 menjadi 000001
    const newKode = `PRED-${nextNumber.toString().padStart(6, "0")}`;

    // 2. Cek Duplikat
    // Tidak boleh ada Predikat untuk Mapel, Tahun, Tingkat, Jurusan, Kelas yang sama persis
    const existing = await trx(table)
      .where({
        KODE_MAPEL: data.KODE_MAPEL,
        TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
        TINGKATAN_ID: data.TINGKATAN_ID,
        JURUSAN_ID: data.JURUSAN_ID || null, // Handle null
        KELAS_ID: data.KELAS_ID || null      // Handle null
      })
      .first();

    if (existing) {
      throw new Error("Data Predikat untuk Mapel & Kelas/Tingkat ini sudah ada.");
    }

    // 3. Insert Data
    const insertData = {
      ...data,
      KODE_PREDIKAT: newKode,
      // Pastikan field null dihandle agar tidak masuk sebagai string "null" atau undefined
      JURUSAN_ID: data.JURUSAN_ID || null,
      KELAS_ID: data.KELAS_ID || null,
    };

    const [id] = await trx(table).insert(insertData);

    // 4. Return Data Baru
    const row = await baseQuery(trx).where("p.ID", id).first();
    return formatRow(row);
  });
};

// =================================================================
// UPDATE & DELETE
// =================================================================

export const updatePredikat = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null; // Atau throw error not found

  // Hapus field yang tidak boleh diedit user (opsional, untuk keamanan)
  delete data.ID;
  delete data.KODE_PREDIKAT; 

  await db(table).where({ ID: id }).update({
    ...data,
    JURUSAN_ID: data.JURUSAN_ID || null,
    KELAS_ID: data.KELAS_ID || null,
  });

  const row = await baseQuery().where("p.ID", id).first();
  return formatRow(row);
};

export const deletePredikat = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing; // Mengembalikan data yang dihapus (biasanya untuk notifikasi frontend)
};