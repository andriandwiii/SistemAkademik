import * as LaporanModel from "../models/laporankeuanganModel.js";

/**
 * Dashboard Summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const { tahun_ajaran_id } = req.query;

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id wajib diisi"
      });
    }

    const data = await LaporanModel.getDashboardSummary(tahun_ajaran_id);

    res.status(200).json({
      status: "00",
      message: "Dashboard summary",
      data
    });
  } catch (err) {
    console.error("❌ Error getDashboardSummary:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Laporan Tunggakan
 */
export const getLaporanTunggakan = async (req, res) => {
  try {
    const { tahun_ajaran_id, batas_waktu } = req.query;

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id wajib diisi"
      });
    }

    const batas = batas_waktu ? parseInt(batas_waktu) : 3;
    const data = await LaporanModel.getLaporanTunggakan(tahun_ajaran_id, batas);

    res.status(200).json({
      status: "00",
      message: `Laporan tunggakan >= ${batas} bulan`,
      total: data.length,
      total_piutang: data.reduce((sum, d) => sum + parseFloat(d.TOTAL_TUNGGAKAN || 0), 0),
      data
    });
  } catch (err) {
    console.error("❌ Error getLaporanTunggakan:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Rekap Per Kelas
 */
export const getRekapPerKelas = async (req, res) => {
  try {
    const { tahun_ajaran_id } = req.query;

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id wajib diisi"
      });
    }

    const data = await LaporanModel.getRekapPerKelas(tahun_ajaran_id);

    // Hitung grand total
    const grandTotal = {
      total_siswa: data.reduce((sum, d) => sum + parseInt(d.JUMLAH_SISWA || 0), 0),
      total_terbayar: data.reduce((sum, d) => sum + parseFloat(d.TOTAL_TERBAYAR || 0), 0),
      total_piutang: data.reduce((sum, d) => sum + parseFloat(d.TOTAL_PIUTANG || 0), 0),
    };

    res.status(200).json({
      status: "00",
      message: "Rekap pembayaran per kelas",
      grand_total: grandTotal,
      data
    });
  } catch (err) {
    console.error("❌ Error getRekapPerKelas:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Laporan Pembayaran Per Periode
 */
export const getLaporanPembayaran = async (req, res) => {
  try {
    const { start_date, end_date, metode_bayar, nis } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: "99",
        message: "start_date dan end_date wajib diisi"
      });
    }

    const filters = {};
    if (metode_bayar) filters.metodeBayar = metode_bayar;
    if (nis) filters.nis = nis;

    const data = await LaporanModel.getLaporanPembayaran(start_date, end_date, filters);

    const totalNominal = data.reduce((sum, d) => sum + parseFloat(d.TOTAL_BAYAR || 0), 0);

    res.status(200).json({
      status: "00",
      message: "Laporan pembayaran per periode",
      periode: { start: start_date, end: end_date },
      total_transaksi: data.length,
      total_nominal: totalNominal,
      data
    });
  } catch (err) {
    console.error("❌ Error getLaporanPembayaran:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Tunggakan Per Komponen
 */
export const getTunggakanPerKomponen = async (req, res) => {
  try {
    const { tahun_ajaran_id } = req.query;

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: "99",
        message: "tahun_ajaran_id wajib diisi"
      });
    }

    const data = await LaporanModel.getTunggakanPerKomponen(tahun_ajaran_id);

    res.status(200).json({
      status: "00",
      message: "Tunggakan per komponen biaya",
      data
    });
  } catch (err) {
    console.error("❌ Error getTunggakanPerKomponen:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * History Pembayaran Siswa
 */
export const getHistoryPembayaranSiswa = async (req, res) => {
  try {
    const { nis } = req.params;
    const { tahun_ajaran_id } = req.query;

    const data = await LaporanModel.getHistoryPembayaranSiswa(nis, tahun_ajaran_id);

    res.status(200).json({
      status: "00",
      message: "History pembayaran siswa",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getHistoryPembayaranSiswa:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};