// File: models/riwayatKenaikanKelasModel.js

import { db } from "../core/config/knex.js";

const table = "riwayat_kenaikan_kelas";

/**
 * 🔹 Generate ID Riwayat Kenaikan
 */
const generateRiwayatId = async (trx) => {
  const last = await trx(table)
    .select("RIWAYAT_ID")
    .orderBy("ID", "desc")
    .first()
    .forUpdate();

  let nextNumber = 1;
  if (last && last.RIWAYAT_ID) {
    const numericPart = parseInt(last.RIWAYAT_ID.replace("RWK", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }
  
  return `RWK${nextNumber.toString().padStart(6, "0")}`;
};

/**
 * 🔹 Simpan Riwayat Kenaikan Kelas (Bulk Insert)
 * Dipanggil dari controller saat proses kenaikan kelas
 */
export const simpanRiwayatKenaikan = async (dataRiwayat, trx) => {
  const dbInstance = trx || db;
  
  if (!Array.isArray(dataRiwayat) || dataRiwayat.length === 0) {
    return 0;
  }

  try {
    // Generate ID untuk setiap riwayat
    let nextNumber = 1;
    const last = await dbInstance(table)
      .select("RIWAYAT_ID")
      .orderBy("ID", "desc")
      .first()
      .forUpdate();

    if (last && last.RIWAYAT_ID) {
      const numericPart = parseInt(last.RIWAYAT_ID.replace("RWK", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }

    // Prepare data untuk insert
    const insertData = dataRiwayat.map((item, index) => {
      const currentNumber = nextNumber + index;
      const riwayatId = `RWK${currentNumber.toString().padStart(6, "0")}`;

      return {
        RIWAYAT_ID: riwayatId,
        NIS: item.NIS,
        STATUS: item.STATUS,
        
        // Data Lama
        TRANSAKSI_LAMA_ID: item.TRANSAKSI_LAMA_ID || null,
        TAHUN_AJARAN_LAMA_ID: item.TAHUN_AJARAN_LAMA_ID || null,
        KELAS_LAMA_ID: item.KELAS_LAMA_ID || null,
        TINGKATAN_LAMA_ID: item.TINGKATAN_LAMA_ID || null,
        JURUSAN_LAMA_ID: item.JURUSAN_LAMA_ID || null,
        
        // Data Baru
        TRANSAKSI_BARU_ID: item.TRANSAKSI_BARU_ID,
        TAHUN_AJARAN_BARU_ID: item.TAHUN_AJARAN_BARU_ID,
        KELAS_BARU_ID: item.KELAS_BARU_ID,
        TINGKATAN_BARU_ID: item.TINGKATAN_BARU_ID,
        JURUSAN_BARU_ID: item.JURUSAN_BARU_ID,
        
        // Metadata
        PROSES_OLEH: item.PROSES_OLEH || "SYSTEM",
        KETERANGAN: item.KETERANGAN || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    // Bulk insert
    await dbInstance(table).insert(insertData);
    
    return insertData.length;
  } catch (error) {
    console.error("❌ Gagal simpan riwayat kenaikan:", error);
    throw error;
  }
};

/**
 * 🔹 Ambil Semua Riwayat Kenaikan dengan JOIN
 */
export const getAllRiwayatKenaikan = async () => {
  try {
    const rows = await db(`${table} as rk`)
      .select(
        "rk.*",
        
        // Data Siswa
        "s.NAMA as NAMA_SISWA",
        "s.GENDER",
        
        // Data Tahun Ajaran Lama
        "ta_lama.NAMA_TAHUN_AJARAN as NAMA_TA_LAMA",
        
        // Data Tahun Ajaran Baru
        "ta_baru.NAMA_TAHUN_AJARAN as NAMA_TA_BARU",
        
        // Data Tingkatan Lama
        "ti_lama.TINGKATAN as TINGKATAN_LAMA",
        
        // Data Tingkatan Baru
        "ti_baru.TINGKATAN as TINGKATAN_BARU",
        
        // Data Jurusan Lama
        "j_lama.NAMA_JURUSAN as NAMA_JURUSAN_LAMA",
        
        // Data Jurusan Baru
        "j_baru.NAMA_JURUSAN as NAMA_JURUSAN_BARU"
      )
      .leftJoin("master_siswa as s", "rk.NIS", "s.NIS")
      .leftJoin("master_tahun_ajaran as ta_lama", "rk.TAHUN_AJARAN_LAMA_ID", "ta_lama.TAHUN_AJARAN_ID")
      .leftJoin("master_tahun_ajaran as ta_baru", "rk.TAHUN_AJARAN_BARU_ID", "ta_baru.TAHUN_AJARAN_ID")
      .leftJoin("master_tingkatan as ti_lama", "rk.TINGKATAN_LAMA_ID", "ti_lama.TINGKATAN_ID")
      .leftJoin("master_tingkatan as ti_baru", "rk.TINGKATAN_BARU_ID", "ti_baru.TINGKATAN_ID")
      .leftJoin("master_jurusan as j_lama", "rk.JURUSAN_LAMA_ID", "j_lama.JURUSAN_ID")
      .leftJoin("master_jurusan as j_baru", "rk.JURUSAN_BARU_ID", "j_baru.JURUSAN_ID")
      .orderBy("rk.ID", "desc");

    return rows.map(formatRow);
  } catch (error) {
    console.error("❌ Gagal ambil riwayat kenaikan:", error);
    throw error;
  }
};

/**
 * 🔹 Format Data untuk Response
 */
const formatRow = (r) => ({
  ID: r.ID,
  RIWAYAT_ID: r.RIWAYAT_ID,
  
  siswa: {
    NIS: r.NIS,
    NAMA: r.NAMA_SISWA,
    GENDER: r.GENDER,
  },
  
  STATUS: r.STATUS,
  
  // Data Asal
  tahun_ajaran_lama: r.TAHUN_AJARAN_LAMA_ID ? {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_LAMA_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TA_LAMA,
  } : null,
  
  kelas_asal: r.KELAS_LAMA_ID ? {
    KELAS_ID: r.KELAS_LAMA_ID,
  } : null,
  
  tingkatan_asal: r.TINGKATAN_LAMA_ID ? {
    TINGKATAN_ID: r.TINGKATAN_LAMA_ID,
    TINGKATAN: r.TINGKATAN_LAMA,
  } : null,
  
  jurusan_asal: r.JURUSAN_LAMA_ID ? {
    JURUSAN_ID: r.JURUSAN_LAMA_ID,
    NAMA_JURUSAN: r.NAMA_JURUSAN_LAMA,
  } : null,
  
  // Data Tujuan
  tahun_ajaran_baru: {
    TAHUN_AJARAN_ID: r.TAHUN_AJARAN_BARU_ID,
    NAMA_TAHUN_AJARAN: r.NAMA_TA_BARU,
  },
  
  kelas_tujuan: {
    KELAS_ID: r.KELAS_BARU_ID,
  },
  
  tingkatan_tujuan: {
    TINGKATAN_ID: r.TINGKATAN_BARU_ID,
    TINGKATAN: r.TINGKATAN_BARU,
  },
  
  jurusan_tujuan: {
    JURUSAN_ID: r.JURUSAN_BARU_ID,
    NAMA_JURUSAN: r.NAMA_JURUSAN_BARU,
  },
  
  // Metadata
  PROSES_OLEH: r.PROSES_OLEH,
  KETERANGAN: r.KETERANGAN,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

/**
 * 🔹 Hapus Riwayat Kenaikan
 */
export const deleteRiwayatKenaikan = async (id) => {
  const existing = await db(table).where({ ID: id }).first();
  if (!existing) return null;

  await db(table).where({ ID: id }).del();
  return existing;
};

/**
 * 🔹 Get Riwayat By NIS (untuk tracking individual siswa)
 */
export const getRiwayatByNIS = async (nis) => {
  try {
    const rows = await db(`${table} as rk`)
      .select(
        "rk.*",
        "s.NAMA as NAMA_SISWA",
        "ta_lama.NAMA_TAHUN_AJARAN as NAMA_TA_LAMA",
        "ta_baru.NAMA_TAHUN_AJARAN as NAMA_TA_BARU",
        "ti_lama.TINGKATAN as TINGKATAN_LAMA",
        "ti_baru.TINGKATAN as TINGKATAN_BARU"
      )
      .leftJoin("master_siswa as s", "rk.NIS", "s.NIS")
      .leftJoin("master_tahun_ajaran as ta_lama", "rk.TAHUN_AJARAN_LAMA_ID", "ta_lama.TAHUN_AJARAN_ID")
      .leftJoin("master_tahun_ajaran as ta_baru", "rk.TAHUN_AJARAN_BARU_ID", "ta_baru.TAHUN_AJARAN_ID")
      .leftJoin("master_tingkatan as ti_lama", "rk.TINGKATAN_LAMA_ID", "ti_lama.TINGKATAN_ID")
      .leftJoin("master_tingkatan as ti_baru", "rk.TINGKATAN_BARU_ID", "ti_baru.TINGKATAN_ID")
      .where("rk.NIS", nis)
      .orderBy("rk.ID", "desc");

    return rows.map(formatRow);
  } catch (error) {
    console.error("❌ Gagal ambil riwayat by NIS:", error);
    throw error;
  }
};