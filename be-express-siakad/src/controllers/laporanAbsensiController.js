import * as StatistikModel from "../models/StatistikAbsensiModel.js";

export const getDashboardBKData = async (req, res) => {
  try {
    // Ambil tanggal dari query, jika tidak ada gunakan tanggal hari ini
    const tanggal = req.query.tanggal || new Date().toISOString().split('T')[0];
    
    // 1. Ambil data statistik untuk Chart (Hadir, Alpa, dll)
    const harian = await StatistikModel.getStatistikHarianKelas(tanggal);
    
    // 2. Ambil detail siswa yang TIDAK HADIR pada tanggal tersebut untuk tabel
    const detailHarian = await StatistikModel.getDetailAbsensiHarian(tanggal);

    // 3. (Opsional) Tetap ambil siswa perhatian jika masih dibutuhkan
    const perhatian = await StatistikModel.getSiswaPerluPerhatian(3);

    res.status(200).json({ 
      status: "00", 
      data: {
        statistik_harian: harian,
        detail_absensi: detailHarian, // Data baru untuk tabel harian
        siswa_perhatian: perhatian
      } 
    });
  } catch (error) {
    console.error("Error Dashboard BK:", error.message);
    res.status(500).json({ status: "99", message: error.message });
  }
};

export const getRekapSiswa = async (req, res) => {
  const { nis, taId } = req.params;
  try {
    const summary = await StatistikModel.getSummaryAbsensiSiswa(nis, taId);
    res.status(200).json({ status: "00", data: { summary } });
  } catch (error) {
    res.status(500).json({ status: "99", message: error.message });
  }
};