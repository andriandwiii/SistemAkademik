// File: models/transaksiSiswaKelasModel.js

import { db } from "../core/config/knex.js";

const table = "transaksi_siswa_kelas";

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

export const getAllTransaksi = async () => {
  const ta = await db("master_tahun_ajaran").where("STATUS", "Aktif").first();
  if (!ta) throw new Error("Tidak ada Tahun Ajaran yang aktif!");
  
  const rows = await baseQuery()
    .where("t.TAHUN_AJARAN_ID", ta.TAHUN_AJARAN_ID)
    .orderBy("t.ID", "desc");

  return rows.map(formatRow);
};

export const createTransaksi = async (data) => {
  return db.transaction(async (trx) => {
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

export const updateTransaksi = async (id, data) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).update(data);
  const row = await baseQuery().where("t.ID", id).first();
  return formatRow(row);
};

export const deleteTransaksi = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};

/**
 * 🔹 Helper: Ambil semua NIS siswa dari kelas & tahun tertentu
 */
export const getSiswaDiKelas = async (kelasId, tahunAjaranId, trx) => {
  const dbInstance = trx || db;
  const rows = await dbInstance(table)
    .select("NIS")
    .where({ KELAS_ID: kelasId, TAHUN_AJARAN_ID: tahunAjaranId });
  
  return rows.map((r) => r.NIS);
};

/**
 * 🔹 Ambil Data Transaksi Lama Siswa (untuk riwayat)
 * Digunakan saat proses kenaikan kelas untuk mendapatkan data asal
 */
export const getTransaksiLamaSiswa = async (nisArray, tahunAjaranLamaId, trx) => {
  const dbInstance = trx || db;
  
  const rows = await dbInstance(table)
    .select("*")
    .whereIn("NIS", nisArray)
    .where("TAHUN_AJARAN_ID", tahunAjaranLamaId);
  
  // Convert to Map untuk mudah akses by NIS
  const map = new Map();
  rows.forEach(r => {
    map.set(r.NIS, r);
  });
  
  return map;
};

/**
 * 🔹 Fitur Inti: Memproses kenaikan/tinggal kelas (Bulk Insert)
 * RETURN: Array of inserted transaction IDs dengan data lengkap
 */
export const prosesKenaikanRombel = async (
  nisSiswaArray,
  dataBaru,
  trx
) => {
  const dbInstance = trx;

  try {
    const last = await dbInstance(table)
      .select("TRANSAKSI_ID")
      .orderBy("ID", "desc")
      .first()
      .forUpdate();
      
    let nextNumber = 1;
    if (last && last.TRANSAKSI_ID) {
      const numericPart = parseInt(last.TRANSAKSI_ID.replace("TRXS", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }

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
       return [];
    }

    await dbInstance(table).insert(dataRiwayatBaru);
    
    // Return data yang di-insert (untuk keperluan riwayat)
    return dataRiwayatBaru;

  } catch (error) {
    console.error("Gagal prosesKenaikanRombel:", error);
    throw error;
  }
};