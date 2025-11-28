import { db } from "../core/config/knex.js";

const table = "master_predikat";

// Format data hasil query agar rapi (Nested JSON)
const formatRow = (r) => ({
  ID: r.ID,
  KODE_PREDIKAT: r.KODE_PREDIKAT,
  TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID, // ✅ Flat field
  tahun_ajaran: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TAHUN_AJARAN,
  },
  TINGKATAN_ID: r.TINGKATAN_ID, // ✅ Flat field (nullable)
  tingkatan: r.TINGKATAN_ID ? {
    TINGKATAN_ID: r.TINGKATAN_ID,
    TINGKATAN: r.TINGKATAN || r.TINGKATAN_ID,
  } : null,
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
      "ta.NAMA_TAHUN_AJARAN",
      "mt.TINGKATAN"
    )
    .leftJoin("master_tahun_ajaran as ta", "p.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .leftJoin("master_tingkatan as mt", "p.TINGKATAN_ID", "mt.TINGKATAN_ID");

// =================================================================
// READ DATA
// =================================================================

/** 🔹 Ambil semua data predikat (Filter tahun ajaran aktif) */
export const getAllPredikat = async () => {
  const daftarTA = await db("master_tahun_ajaran")
    .where("STATUS", "Aktif")
    .select("TAHUN_AJARAN_ID");

  const daftarID_TA = daftarTA.map((ta) => ta.TAHUN_AJARAN_ID);

  if (!daftarID_TA || daftarID_TA.length === 0) {
    return [];
  }

  const rows = await baseQuery()
    .whereIn("p.TAHUN_AJARAN_ID", daftarID_TA)
    .orderBy("p.ID", "desc");

  return rows.map(formatRow);
};

/** 🔹 Ambil satu data by ID */
export const getPredikatById = async (id) => {
  const row = await baseQuery().where("p.ID", id).first();
  return row ? formatRow(row) : null;
};

/** 🔹 Cek duplikat predikat (tahun + tingkatan) */
export const checkDuplicate = async (TAHUN_AJARAN_ID, TINGKATAN_ID) => {
  const query = db(table)
    .where("TAHUN_AJARAN_ID", TAHUN_AJARAN_ID);

  if (TINGKATAN_ID) {
    query.where("TINGKATAN_ID", TINGKATAN_ID);
  } else {
    query.whereNull("TINGKATAN_ID");
  }

  return query.first();
};

/** 🔹 Cek duplikat kecuali ID tertentu (untuk update) */
export const checkDuplicateExcept = async (TAHUN_AJARAN_ID, TINGKATAN_ID, excludeId) => {
  const query = db(table)
    .where("TAHUN_AJARAN_ID", TAHUN_AJARAN_ID)
    .whereNot("ID", excludeId);

  if (TINGKATAN_ID) {
    query.where("TINGKATAN_ID", TINGKATAN_ID);
  } else {
    query.whereNull("TINGKATAN_ID");
  }

  return query.first();
};

// =================================================================
// CREATE DATA
// =================================================================

export const createPredikat = async (data) => {
  return db.transaction(async (trx) => {
    // 1. Generate Custom ID (Format: PRED-000001)
    const last = await trx(table)
      .select("KODE_PREDIKAT")
      .orderBy("ID", "desc")
      .first()
      .forUpdate();

    let nextNumber = 1;
    if (last && last.KODE_PREDIKAT) {
      const numericPart = parseInt(last.KODE_PREDIKAT.replace("PRED-", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    const newKode = `PRED-${nextNumber.toString().padStart(6, "0")}`;

    // 2. Insert Data
    const insertData = {
      KODE_PREDIKAT: newKode,
      TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
      TINGKATAN_ID: data.TINGKATAN_ID || null,
      DESKRIPSI_A: data.DESKRIPSI_A,
      DESKRIPSI_B: data.DESKRIPSI_B,
      DESKRIPSI_C: data.DESKRIPSI_C,
      DESKRIPSI_D: data.DESKRIPSI_D,
    };

    const [id] = await trx(table).insert(insertData);

    // 3. Return Data Baru
    const row = await baseQuery(trx).where("p.ID", id).first();
    return formatRow(row);
  });
};

// =================================================================
// UPDATE & DELETE
// =================================================================

export const updatePredikat = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  // Hapus field yang tidak boleh diedit
  delete data.ID;
  delete data.KODE_PREDIKAT;

  await db(table).where({ ID: id }).update({
    TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID,
    TINGKATAN_ID: data.TINGKATAN_ID !== undefined ? data.TINGKATAN_ID : existing.TINGKATAN_ID,
    DESKRIPSI_A: data.DESKRIPSI_A,
    DESKRIPSI_B: data.DESKRIPSI_B,
    DESKRIPSI_C: data.DESKRIPSI_C,
    DESKRIPSI_D: data.DESKRIPSI_D,
    updated_at: db.fn.now(),
  });

  const row = await baseQuery().where("p.ID", id).first();
  return formatRow(row);
};

export const deletePredikat = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};