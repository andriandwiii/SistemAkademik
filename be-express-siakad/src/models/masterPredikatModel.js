import { db } from "../core/config/knex.js";

const table = "master_predikat";

// ======================
// FORMAT DATA
// ======================
const formatRow = (r) => ({
  ID: r.ID,
  KODE_PREDIKAT: r.KODE_PREDIKAT,

  mapel: {
    KODE_MAPEL: r.KODE_MAPEL,
    NAMA_MAPEL: r.NAMA_MAPEL || r.KODE_MAPEL,
  },

  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN,
  },

  target: {
    TINGKATAN_ID: r.TINGKATAN_ID,
    TINGKATAN: r.TINGKATAN, // X, XI, XII
    JURUSAN_ID: r.JURUSAN_ID || null,
    NAMA_JURUSAN: r.NAMA_JURUSAN || "Semua Jurusan",
    KELAS_ID: r.KELAS_ID || null,
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

// ======================
// BASE QUERY
// ======================
const baseQuery = (trx = db) =>
  trx(`${table} as p`)
    .select(
      "p.*",
      "mp.NAMA_MAPEL",
      "ta.NAMA_TAHUN_AJARAN",
      "mj.NAMA_JURUSAN",
      "mt.TINGKATAN" // JOIN nama tingkatan (X, XI, XII)
    )
    .leftJoin("master_mata_pelajaran as mp", "p.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_tahun_ajaran as ta", "p.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .leftJoin("master_jurusan as mj", "p.JURUSAN_ID", "mj.JURUSAN_ID")
    .leftJoin("master_tingkatan as mt", "p.TINGKATAN_ID", "mt.TINGKATAN_ID");

// =================================================================
// GET ALL (FILTER TAHUN AJARAN AKTIF)
// =================================================================
export const getAllPredikat = async () => {
  const daftarTA = await db("master_tahun_ajaran")
    .where("STATUS", "Aktif")
    .select("TAHUN_AJARAN_ID");

  const daftarID_TA = daftarTA.map((ta) => ta.TAHUN_AJARAN_ID);

  if (daftarID_TA.length === 0) return [];

  const rows = await baseQuery()
    .whereIn("p.TAHUN_AJARAN_ID", daftarID_TA)
    .orderBy("p.ID", "desc");

  return rows.map(formatRow);
};

// =================================================================
// GET BY ID
// =================================================================
export const getPredikatById = async (id) => {
  const row = await baseQuery().where("p.ID", id).first();
  return row ? formatRow(row) : null;
};

// =================================================================
// CREATE
// =================================================================
export const createPredikat = async (data) => {
  return db.transaction(async (trx) => {
    // Ambil kode terakhir
    const last = await trx(table)
      .select("KODE_PREDIKAT")
      .orderBy("ID", "desc")
      .first()
      .forUpdate();

    // Generate next kode PRED-000001
    let nextNumber = 1;
    if (last?.KODE_PREDIKAT) {
      const numericPart = parseInt(last.KODE_PREDIKAT.replace("PRED-", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }

    const newKode = `PRED-${nextNumber.toString().padStart(6, "0")}`;

    // Cek duplikasi
    const existing = await trx(table)
      .where({
        KODE_MAPEL: data.KODE_MAPEL,
        TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
        TINGKATAN_ID: data.TINGKATAN_ID,
        JURUSAN_ID: data.JURUSAN_ID || null,
        KELAS_ID: data.KELAS_ID || null,
      })
      .first();

    if (existing) {
      throw new Error("Data Predikat untuk Mapel & Kelas/Tingkat ini sudah ada.");
    }

    // Insert
    const insertData = {
      ...data,
      KODE_PREDIKAT: newKode,
      JURUSAN_ID: data.JURUSAN_ID || null,
      KELAS_ID: data.KELAS_ID || null,
    };

    const [id] = await trx(table).insert(insertData);

    const row = await baseQuery(trx).where("p.ID", id).first();
    return formatRow(row);
  });
};

// =================================================================
// UPDATE
// =================================================================
export const updatePredikat = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  // Tidak boleh mengubah ID & KODE_PREDIKAT
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

// =================================================================
// DELETE
// =================================================================
export const deletePredikat = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};
