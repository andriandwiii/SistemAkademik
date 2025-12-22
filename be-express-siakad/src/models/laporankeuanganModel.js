import { db } from "../core/config/knex.js";

/**
 * Laporan Tunggakan Siswa
 */
export const getLaporanTunggakan = async (tahunAjaranId, batasWaktu = 3) => {
  return db("tagihan_siswa as t")
    .join("master_siswa as s", "t.NIS", "s.NIS")
    .join("transaksi_siswa_kelas as tsk", function() {
      this.on("s.NIS", "=", "tsk.NIS")
          .andOn("t.TAHUN_AJARAN_ID", "=", "tsk.TAHUN_AJARAN_ID");
    })
    .leftJoin("master_kelas as k", "tsk.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "s.NIS",
      "s.NAMA",
      "s.NO_TELP",
      "r.NAMA_RUANG as KELAS",
      db.raw("COUNT(t.TAGIHAN_ID) as JUMLAH_TUNGGAKAN"),
      db.raw("SUM(t.TOTAL) as TOTAL_TUNGGAKAN")
    )
    .where("t.TAHUN_AJARAN_ID", tahunAjaranId)
    .whereIn("t.STATUS", ["BELUM_BAYAR", "SEBAGIAN"])
    .groupBy("s.NIS", "s.NAMA", "s.NO_TELP", "r.NAMA_RUANG")
    .having(db.raw("COUNT(t.TAGIHAN_ID)"), ">=", batasWaktu)
    .orderBy("JUMLAH_TUNGGAKAN", "desc");
};

/**
 * Rekap Pembayaran Per Kelas
 */
export const getRekapPerKelas = async (tahunAjaranId) => {
  return db("tagihan_siswa as t")
    .join("transaksi_siswa_kelas as tsk", function() {
      this.on("t.NIS", "=", "tsk.NIS")
          .andOn("t.TAHUN_AJARAN_ID", "=", "tsk.TAHUN_AJARAN_ID");
    })
    .leftJoin("master_kelas as k", "tsk.KELAS_ID", "k.KELAS_ID")
    .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "r.NAMA_RUANG as KELAS",
      "tsk.KELAS_ID",
      db.raw("COUNT(DISTINCT t.NIS) as JUMLAH_SISWA"),
      db.raw("SUM(CASE WHEN t.STATUS = 'LUNAS' THEN 1 ELSE 0 END) as LUNAS"),
      db.raw("SUM(CASE WHEN t.STATUS IN ('BELUM_BAYAR', 'SEBAGIAN') THEN 1 ELSE 0 END) as BELUM_LUNAS"),
      db.raw("SUM(CASE WHEN t.STATUS = 'LUNAS' THEN t.TOTAL ELSE 0 END) as TOTAL_TERBAYAR"),
      db.raw("SUM(CASE WHEN t.STATUS IN ('BELUM_BAYAR', 'SEBAGIAN') THEN t.TOTAL ELSE 0 END) as TOTAL_PIUTANG")
    )
    .where("t.TAHUN_AJARAN_ID", tahunAjaranId)
    .groupBy("r.NAMA_RUANG", "tsk.KELAS_ID")
    .orderBy("r.NAMA_RUANG");
};

/**
 * Dashboard Summary Keuangan
 */
export const getDashboardSummary = async (tahunAjaranId) => {
  // Total Tagihan
  const totalTagihan = await db("tagihan_siswa")
    .where("TAHUN_AJARAN_ID", tahunAjaranId)
    .sum("TOTAL as total")
    .count("* as jumlah")
    .first();

  // Total Terbayar
  const totalTerbayar = await db("tagihan_siswa")
    .where("TAHUN_AJARAN_ID", tahunAjaranId)
    .where("STATUS", "LUNAS")
    .sum("TOTAL as total")
    .count("* as jumlah")
    .first();

  // Total Tunggakan
  const totalTunggakan = await db("tagihan_siswa")
    .where("TAHUN_AJARAN_ID", tahunAjaranId)
    .whereIn("STATUS", ["BELUM_BAYAR", "SEBAGIAN"])
    .sum("TOTAL as total")
    .count("* as jumlah")
    .first();

  // Siswa Menunggak
  const siswaMenunggak = await db("tagihan_siswa")
    .where("TAHUN_AJARAN_ID", tahunAjaranId)
    .whereIn("STATUS", ["BELUM_BAYAR", "SEBAGIAN"])
    .countDistinct("NIS as jumlah")
    .first();

  // Pembayaran Hari Ini
  const today = new Date().toISOString().split("T")[0];
  const pembayaranHariIni = await db("pembayaran")
    .where("STATUS", "SUKSES")
    .whereRaw("DATE(TGL_BAYAR) = ?", [today])
    .sum("TOTAL_BAYAR as total")
    .count("* as jumlah")
    .first();

  // Statistik Metode Pembayaran (Bulan Ini)
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const metodeBayar = await db("pembayaran")
    .select("METODE_BAYAR")
    .count("* as jumlah")
    .sum("TOTAL_BAYAR as total")
    .where("STATUS", "SUKSES")
    .where("TGL_BAYAR", ">=", firstDayOfMonth)
    .groupBy("METODE_BAYAR")
    .orderBy("total", "desc");

  return {
    total_tagihan: parseFloat(totalTagihan?.total || 0),
    jumlah_tagihan: parseInt(totalTagihan?.jumlah || 0),
    total_terbayar: parseFloat(totalTerbayar?.total || 0),
    jumlah_terbayar: parseInt(totalTerbayar?.jumlah || 0),
    total_tunggakan: parseFloat(totalTunggakan?.total || 0),
    jumlah_tunggakan: parseInt(totalTunggakan?.jumlah || 0),
    siswa_menunggak: parseInt(siswaMenunggak?.jumlah || 0),
    pembayaran_hari_ini: {
      total: parseFloat(pembayaranHariIni?.total || 0),
      jumlah_transaksi: parseInt(pembayaranHariIni?.jumlah || 0),
    },
    metode_bayar_bulan_ini: metodeBayar,
  };
};

/**
 * Laporan Pembayaran Per Periode
 */
export const getLaporanPembayaran = async (startDate, endDate, filters = {}) => {
  let query = db("pembayaran as p")
    .leftJoin("master_siswa as s", "p.NIS", "s.NIS")
    .leftJoin("detail_pembayaran as dp", "p.PEMBAYARAN_ID", "dp.PEMBAYARAN_ID")
    .leftJoin("tagihan_siswa as t", "dp.TAGIHAN_ID", "t.TAGIHAN_ID")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "p.PEMBAYARAN_ID",
      "p.NOMOR_PEMBAYARAN",
      "p.TGL_BAYAR",
      "p.METODE_BAYAR",
      "p.TOTAL_BAYAR",
      "s.NIS",
      "s.NAMA as NAMA_SISWA",
      db.raw("GROUP_CONCAT(k.NAMA_KOMPONEN SEPARATOR ', ') as KOMPONEN")
    )
    .where("p.STATUS", "SUKSES")
    .whereBetween("p.TGL_BAYAR", [startDate, endDate])
    .groupBy("p.PEMBAYARAN_ID", "p.NOMOR_PEMBAYARAN", "p.TGL_BAYAR", "p.METODE_BAYAR", "p.TOTAL_BAYAR", "s.NIS", "s.NAMA")
    .orderBy("p.TGL_BAYAR", "desc");

  if (filters.metodeBayar) {
    query.where("p.METODE_BAYAR", filters.metodeBayar);
  }

  if (filters.nis) {
    query.where("s.NIS", filters.nis);
  }

  return query;
};

/**
 * Laporan Tunggakan Per Komponen
 */
export const getTunggakanPerKomponen = async (tahunAjaranId) => {
  return db("tagihan_siswa as t")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA",
      db.raw("COUNT(*) as JUMLAH_TAGIHAN"),
      db.raw("SUM(t.TOTAL) as TOTAL_NOMINAL"),
      db.raw("SUM(CASE WHEN t.STATUS = 'LUNAS' THEN t.TOTAL ELSE 0 END) as TOTAL_TERBAYAR"),
      db.raw("SUM(CASE WHEN t.STATUS != 'LUNAS' THEN t.TOTAL ELSE 0 END) as TOTAL_TUNGGAKAN")
    )
    .where("t.TAHUN_AJARAN_ID", tahunAjaranId)
    .groupBy("k.NAMA_KOMPONEN", "k.JENIS_BIAYA")
    .orderBy("TOTAL_TUNGGAKAN", "desc");
};

/**
 * History Pembayaran Siswa
 */
export const getHistoryPembayaranSiswa = async (nis, tahunAjaranId = null) => {
  let query = db("pembayaran as p")
    .leftJoin("detail_pembayaran as dp", "p.PEMBAYARAN_ID", "dp.PEMBAYARAN_ID")
    .leftJoin("tagihan_siswa as t", "dp.TAGIHAN_ID", "t.TAGIHAN_ID")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "p.*",
      db.raw("GROUP_CONCAT(CONCAT(k.NAMA_KOMPONEN, ' (', dp.JUMLAH_BAYAR, ')') SEPARATOR ', ') as DETAIL_PEMBAYARAN")
    )
    .where("p.NIS", nis)
    .where("p.STATUS", "SUKSES")
    .groupBy("p.PEMBAYARAN_ID")
    .orderBy("p.TGL_BAYAR", "desc");

  if (tahunAjaranId) {
    query.where("t.TAHUN_AJARAN_ID", tahunAjaranId);
  }

  return query;
};