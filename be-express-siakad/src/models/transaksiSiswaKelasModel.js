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

// ==========================================================
// VVVV PERBAIKAN: Query join (Dibuat agar bisa menerima 'trx' untuk transaksi) VVVV
// ==========================================================
const baseQuery = (trx = db) => // <-- Tambahkan parameter opsional trx
  trx(`${table} as t`) // <-- Gunakan trx atau db
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

// Ambil semua transaksi
export const getAllTransaksi = async () => {
  // 1. Dapatkan dulu ID Tahun Ajaran yang AKTIF
  // ==========================================================
  // VVVV PERBAIKAN WAJIB: Sesuaikan dengan data Anda ('Aktif' bukan 'AKTIF') VVVV
  // ==========================================================
  const ta = await db("master_tahun_ajaran").where("STATUS", "Aktif").first();
  if (!ta) throw new Error("Tidak ada Tahun Ajaran yang aktif!");
  
  // 2. Ambil transaksi HANYA dari tahun ajaran aktif
  const rows = await baseQuery() // <-- baseQuery() otomatis pakai 'db'
    .where("t.TAHUN_AJARAN_ID", ta.TAHUN_AJARAN_ID) // <-- FILTER AKTIF
    .orderBy("t.ID", "desc");

  return rows.map(formatRow);
};

// Tambah transaksi baru (misal: siswa baru masuk)
export const createTransaksi = async (data) => {
  // ==========================================================
  // VVVV PERBAIKAN KEAMANAN: Bungkus dengan Transaksi VVVV
  // Ini untuk mencegah 2 admin membuat TRXS_ID yang sama di waktu bersamaan
  // ==========================================================
  return db.transaction(async (trx) => {
    // 🔹 Ambil transaksi terakhir (di dalam transaksi + dikunci)
    const last = await trx(table) // <-- Gunakan 'trx'
      .select("TRANSAKSI_ID")
      .orderBy("ID", "desc")
      .first()
      .forUpdate(); // <-- Kunci baris ini agar ID aman

    let nextNumber = 1;
    if (last && last.TRANSAKSI_ID) {
      const numericPart = parseInt(last.TRANSAKSI_ID.replace("TRXS", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    const newId = `TRXS${nextNumber.toString().padStart(6, "0")}`;

    // 🔹 Cek duplikat (di dalam transaksi)
    const existing = await trx(table) // <-- Gunakan 'trx'
      .where({ NIS: data.NIS, TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID })
      .first();
    if (existing) {
      throw new Error("Siswa sudah terdaftar di kelas lain pada tahun ajaran ini.");
    }
    
    const insertData = {
      ...data,
      TRANSAKSI_ID: newId, // otomatis
    };

    const [id] = await trx(table).insert(insertData); // <-- Gunakan 'trx'
    
    // Kita panggil baseQuery dengan 'trx'
    const row = await baseQuery(trx).where("t.ID", id).first(); 
    return formatRow(row);
  });
  // ==========================================================
};

// Update transaksi (misal: siswa salah input kelas di TAHUN YG SAMA)
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

// =================================================================
// FUNGSI BARU UNTUK KENAIKAN KELAS (Sudah Aman)
// =================================================================

/**
 * 🔹 [BARU] Helper: Ambil semua NIS siswa dari kelas & tahun tertentu
 */
export const getSiswaDiKelas = async (kelasId, tahunAjaranId, trx) => {
  const dbInstance = trx || db;
  const rows = await dbInstance(table)
    .select("NIS")
    .where({ KELAS_ID: kelasId, TAHUN_AJARAN_ID: tahunAjaranId });
  
  return rows.map((r) => r.NIS); // Cth: ['1001', '1002', '1003']
};


/**
 * 🔹 [BARU] Fitur Inti: Memproses kenaikan/tinggal kelas (Bulk Insert)
 */
export const prosesKenaikanRombel = async (
  nisSiswaArray,
  dataBaru, // Cth: { TINGKATAN_ID: "TI11", JURUSAN_ID: "J011", KELAS_ID: "XIMA", TAHUN_AJARAN_ID: "TA2026" }
  trx // Wajib diisi 'trx' dari controller
) => {
  
  const dbInstance = trx; // HANYA gunakan 'trx' untuk fungsi ini

  try {
    // 1. Ambil ID Transaksi terakhir (Aman karena 'trx' sudah dikunci controllernya)
    // ==========================================================
    // VVVV PERBAIKAN KEAMANAN: Tambah .forUpdate() VVVV
    // ==========================================================
    const last = await dbInstance(table)
      .select("TRANSAKSI_ID")
      .orderBy("ID", "desc")
      .first()
      .forUpdate(); // <-- Kunci tabel agar ID tidak bentrok
      
    let nextNumber = 1;
    if (last && last.TRANSAKSI_ID) {
      const numericPart = parseInt(last.TRANSAKSI_ID.replace("TRXS", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }

    // 2. Siapkan data riwayat baru untuk di-INSERT
    const dataRiwayatBaru = nisSiswaArray.map((nis, index) => {
      const currentNumber = nextNumber + index;
      const newId = `TRXS${currentNumber.toString().padStart(6, "0")}`;

      return {
        TRANSAKSI_ID: newId, 
        NIS: nis,
        TINGKATAN_ID: dataBaru.TINGKATAN_ID,
        JURUSAN_ID: dataBaru.JURUSAN_ID,
        KELAS_ID: dataBaru.KELAS_ID,
        TAHUN_AJARAN_ID: dataBaru.TAHUN_AJARAN_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    if (dataRiwayatBaru.length === 0) {
       console.log("Tidak ada siswa untuk diproses di kelas ini.");
       return 0; // Mengembalikan 0 siswa diproses
    }

    // 3. INSERT semua siswa (misal 30 data baru) sekaligus
    await dbInstance("transaksi_siswa_kelas").insert(dataRiwayatBaru);
    
    return dataRiwayatBaru.length;

  } catch (error) {
    console.error("Gagal prosesKenaikanRombel:", error);
    // Lemparkan error agar transaksi di controller bisa di-rollback
    // Ini PENTING jika ada 1 siswa melanggar constraint 'uniq_siswa_tahun'
    throw error;
  }
};