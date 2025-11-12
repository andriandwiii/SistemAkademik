// File: controllers/transaksiKenaikakanKelasController.js

import { db } from "../core/config/knex.js";
import * as SiswaKelasModel from "../models/transaksiSiswaKelasModel.js";
import * as RiwayatKenaikanModel from "../models/riwayatKenaikanKelasModel.js";

/**
 * 🔹 Controller untuk memproses Kenaikan Kelas per Rombel (Otomatis)
 */
export const prosesKenaikanRombelController = async (req, res) => {
  const {
    taLamaId,
    taBaruId,
    pemetaan,
  } = req.body;

  // Validasi input
  if (!taLamaId || !taBaruId || !pemetaan || pemetaan.length === 0) {
    return res.status(400).json({
      status: "01",
      message: "Data pemetaan tidak lengkap (taLamaId, taBaruId, pemetaan).",
    });
  }

  const trx = await db.transaction();

  try {
    let totalSiswaDiproses = 0;
    const allRiwayatData = []; // Untuk menyimpan semua riwayat kenaikan

    for (const peta of pemetaan) {
      let nisSiswaArray = [];
      let status = "NAIK"; // Default status

      // --- KASUS 1: SISWA LULUS ---
      if (peta.status === "LULUS") {
        nisSiswaArray = await SiswaKelasModel.getSiswaDiKelas(
          peta.dariKelas,
          taLamaId,
          trx
        );
        
        if (nisSiswaArray.length > 0) {
          // Update status siswa di master_siswa
          await trx("master_siswa")
            .whereIn("NIS", nisSiswaArray)
            .update({ STATUS: "LULUS" });
          
          // Ambil data transaksi lama untuk riwayat
          const transaksiLamaMap = await SiswaKelasModel.getTransaksiLamaSiswa(
            nisSiswaArray,
            taLamaId,
            trx
          );
          
          // Simpan ke array riwayat (untuk siswa lulus, tidak ada transaksi baru)
          nisSiswaArray.forEach(nis => {
            const dataLama = transaksiLamaMap.get(nis);
            if (dataLama) {
              allRiwayatData.push({
                NIS: nis,
                STATUS: "LULUS",
                TRANSAKSI_LAMA_ID: dataLama.TRANSAKSI_ID,
                TAHUN_AJARAN_LAMA_ID: dataLama.TAHUN_AJARAN_ID,
                KELAS_LAMA_ID: dataLama.KELAS_ID,
                TINGKATAN_LAMA_ID: dataLama.TINGKATAN_ID,
                JURUSAN_LAMA_ID: dataLama.JURUSAN_ID,
                // Data baru = sama dengan lama (karena lulus)
                TRANSAKSI_BARU_ID: dataLama.TRANSAKSI_ID,
                TAHUN_AJARAN_BARU_ID: dataLama.TAHUN_AJARAN_ID,
                KELAS_BARU_ID: dataLama.KELAS_ID,
                TINGKATAN_BARU_ID: dataLama.TINGKATAN_ID,
                JURUSAN_BARU_ID: dataLama.JURUSAN_ID,
                KETERANGAN: "Siswa Lulus",
              });
            }
          });
          
          totalSiswaDiproses += nisSiswaArray.length;
        }

      // --- KASUS 2: NAIK KELAS ---
      } else if (peta.nisNaik && peta.nisNaik.length > 0) {
        nisSiswaArray = peta.nisNaik;
        status = "NAIK";

        // Ambil data transaksi lama
        const transaksiLamaMap = await SiswaKelasModel.getTransaksiLamaSiswa(
          nisSiswaArray,
          taLamaId,
          trx
        );

        const dataBaru = {
          TINGKATAN_ID: peta.keTingkatan,
          JURUSAN_ID: peta.keJurusan,
          KELAS_ID: peta.keKelas,
          TAHUN_AJARAN_ID: taBaruId,
        };
        
        // Insert transaksi baru
        const transaksiBaruArray = await SiswaKelasModel.prosesKenaikanRombel(
          nisSiswaArray,
          dataBaru,
          trx
        );
        
        // Simpan ke array riwayat
        transaksiBaruArray.forEach(trxBaru => {
          const dataLama = transaksiLamaMap.get(trxBaru.NIS);
          allRiwayatData.push({
            NIS: trxBaru.NIS,
            STATUS: status,
            TRANSAKSI_LAMA_ID: dataLama?.TRANSAKSI_ID || null,
            TAHUN_AJARAN_LAMA_ID: dataLama?.TAHUN_AJARAN_ID || null,
            KELAS_LAMA_ID: dataLama?.KELAS_ID || null,
            TINGKATAN_LAMA_ID: dataLama?.TINGKATAN_ID || null,
            JURUSAN_LAMA_ID: dataLama?.JURUSAN_ID || null,
            TRANSAKSI_BARU_ID: trxBaru.TRANSAKSI_ID,
            TAHUN_AJARAN_BARU_ID: trxBaru.TAHUN_AJARAN_ID,
            KELAS_BARU_ID: trxBaru.KELAS_ID,
            TINGKATAN_BARU_ID: trxBaru.TINGKATAN_ID,
            JURUSAN_BARU_ID: trxBaru.JURUSAN_ID,
            KETERANGAN: `Naik dari ${dataLama?.KELAS_ID || '-'} ke ${trxBaru.KELAS_ID}`,
          });
        });
        
        totalSiswaDiproses += transaksiBaruArray.length;

      // --- KASUS 3: TINGGAL KELAS ---
      } else if (peta.nisTinggal && peta.nisTinggal.length > 0) {
        nisSiswaArray = peta.nisTinggal;
        status = "TINGGAL";

        // Ambil data transaksi lama
        const transaksiLamaMap = await SiswaKelasModel.getTransaksiLamaSiswa(
          nisSiswaArray,
          taLamaId,
          trx
        );

        const dataBaru = {
          TINGKATAN_ID: peta.keTingkatan,
          JURUSAN_ID: peta.keJurusan,
          KELAS_ID: peta.keKelas,
          TAHUN_AJARAN_ID: taBaruId,
        };
        
        // Insert transaksi baru (dengan kelas yang sama)
        const transaksiBaruArray = await SiswaKelasModel.prosesKenaikanRombel(
          nisSiswaArray,
          dataBaru,
          trx
        );
        
        // Simpan ke array riwayat
        transaksiBaruArray.forEach(trxBaru => {
          const dataLama = transaksiLamaMap.get(trxBaru.NIS);
          allRiwayatData.push({
            NIS: trxBaru.NIS,
            STATUS: status,
            TRANSAKSI_LAMA_ID: dataLama?.TRANSAKSI_ID || null,
            TAHUN_AJARAN_LAMA_ID: dataLama?.TAHUN_AJARAN_ID || null,
            KELAS_LAMA_ID: dataLama?.KELAS_ID || null,
            TINGKATAN_LAMA_ID: dataLama?.TINGKATAN_ID || null,
            JURUSAN_LAMA_ID: dataLama?.JURUSAN_ID || null,
            TRANSAKSI_BARU_ID: trxBaru.TRANSAKSI_ID,
            TAHUN_AJARAN_BARU_ID: trxBaru.TAHUN_AJARAN_ID,
            KELAS_BARU_ID: trxBaru.KELAS_ID,
            TINGKATAN_BARU_ID: trxBaru.TINGKATAN_ID,
            JURUSAN_BARU_ID: trxBaru.JURUSAN_ID,
            KETERANGAN: `Tinggal di kelas ${trxBaru.KELAS_ID}`,
          });
        });
        
        totalSiswaDiproses += transaksiBaruArray.length;
      }
    }

    // 🔹 SIMPAN SEMUA RIWAYAT KE TABEL riwayat_kenaikan_kelas
    if (allRiwayatData.length > 0) {
      await RiwayatKenaikanModel.simpanRiwayatKenaikan(allRiwayatData, trx);
    }

    // Update status Tahun Ajaran
    await trx("master_tahun_ajaran")
      .where("TAHUN_AJARAN_ID", taLamaId)
      .update({ STATUS: "Tidak Aktif" });

    await trx("master_tahun_ajaran")
      .where("TAHUN_AJARAN_ID", taBaruId)
      .update({ STATUS: "Aktif" });

    await trx.commit();

    res.status(200).json({
      status: "00",
      message: `Proses Kenaikan Kelas berhasil. ${totalSiswaDiproses} siswa telah diproses.`,
    });

  } catch (error) {
    await trx.rollback();
    console.error("❌ Gagal total proses Kenaikan Kelas:", error);
    res.status(500).json({
      status: "99",
      message: "Proses Kenaikan Kelas Gagal: " + error.message,
    });
  }
};

/**
 * 🔹 GET Riwayat Kenaikan Kelas (dari tabel riwayat_kenaikan_kelas)
 */
export const getRiwayatKenaikanKelasController = async (req, res) => {
  try {
    const riwayat = await RiwayatKenaikanModel.getAllRiwayatKenaikan();
    
    res.status(200).json({
      status: "00",
      message: "Berhasil mengambil riwayat kenaikan kelas",
      data: riwayat,
    });
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat kenaikan kelas:", error);
    res.status(500).json({
      status: "99",
      message: "Gagal mengambil riwayat kenaikan kelas: " + error.message,
    });
  }
};

/**
 * 🔹 DELETE Riwayat Kenaikan Kelas
 */
export const deleteRiwayatKenaikanController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await RiwayatKenaikanModel.deleteRiwayatKenaikan(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: "01",
        message: "Data riwayat tidak ditemukan",
      });
    }
    
    res.status(200).json({
      status: "00",
      message: "Riwayat kenaikan berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    console.error("❌ Gagal menghapus riwayat:", error);
    res.status(500).json({
      status: "99",
      message: "Gagal menghapus riwayat: " + error.message,
    });
  }
};

/**
 * 🔹 GET Riwayat Kenaikan by NIS (Bonus: track individual siswa)
 */
export const getRiwayatByNISController = async (req, res) => {
  try {
    const { nis } = req.params;
    
    const riwayat = await RiwayatKenaikanModel.getRiwayatByNIS(nis);
    
    res.status(200).json({
      status: "00",
      message: "Berhasil mengambil riwayat siswa",
      data: riwayat,
    });
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat by NIS:", error);
    res.status(500).json({
      status: "99",
      message: "Gagal mengambil riwayat: " + error.message,
    });
  }
};