// File: controllers/transaksiKenaikakanKelasController.js

import { db } from "../core/config/knex.js";
// Pastikan path ini benar mengarah ke model Anda
import * as SiswaKelasModel from "../models/transaksiSiswaKelasModel.js"; 

/**
 * 🔹 Controller untuk memproses Kenaikan Kelas per Rombel (Otomatis)
 * Ini akan dipanggil oleh halaman Admin "Kenaikan Kelas"
 */
export const prosesKenaikanRombelController = async (req, res) => {
  // Data yang dikirim dari Frontend (halaman "Pilih" Admin):
  const {
    taLamaId, // cth: "2425" (TAHUN_AJARAN_ID lama)
    taBaruId, // cth: "TA2025" (TAHUN_AJARAN_ID baru)
    pemetaan, // Array pemetaan kelas
  } = req.body;

  // ==========================================================
  // CONTOH 'pemetaan' YANG DIHARAPKAN DARI FRONTEND
  // (Frontend harus mengirim daftar NIS siswanya)
  // ==========================================================
  // [
  //   { 
  //     // --- Objek 1: Siswa yang NAIK ---
  //     "dariKelas": "XMA", 
  //     "keTingkatan": "TI11", 
  //     "keJurusan": "J011", 
  //     "keKelas": "XIMA",
  //     "nisNaik": ["1001", "1002", "1003", "...dll"] // <-- Daftar NIS yang naik
  //   },
  //   { 
  //     // --- Objek 2: Siswa yang TINGGAL ---
  //     "dariKelas": "XMA", // <-- Asal kelasnya sama
  //     "status": "TINGGAL",
  //     "keTingkatan": "TI10", // <-- Tingkatannya tetap
  //     "keJurusan": "J011",
  //     "keKelas": "XMA", // <-- Kelas tujuannya sama
  //     "nisTinggal": ["1004"] // <-- Daftar NIS yang tinggal
  //   },
  //   { 
  //     // --- Objek 3: Siswa yang LULUS ---
  //     "dariKelas": "XIIMIPA", 
  //     "status": "LULUS" 
  //     // (Lulus tidak perlu daftar NIS, kita proses semua)
  //   }
  // ]
  // ==========================================================


  // Validasi input sederhana
  if (!taLamaId || !taBaruId || !pemetaan || pemetaan.length === 0) {
    return res.status(400).json({
      status: "01",
      message: "Data pemetaan tidak lengkap (taLamaId, taBaruId, pemetaan).",
    });
  }


  // 1. Mulai Transaksi Database (WAJIB!)
  const trx = await db.transaction();

  try {
    let totalSiswaDiproses = 0;

    // 2. Loop setiap 'peta' yang dikirim oleh Admin
    for (const peta of pemetaan) {
      
      let nisSiswaArray = [];

      // --- KASUS 1: SISWA LULUS ---
      // Jika statusnya LULUS, kita ambil semua siswa dari 'dariKelas'
      if (peta.status === "LULUS") {
        
        nisSiswaArray = await SiswaKelasModel.getSiswaDiKelas(
          peta.dariKelas,
          taLamaId,
          trx
        );
        
        if (nisSiswaArray.length > 0) {
          await trx("master_siswa")
            .whereIn("NIS", nisSiswaArray)
            .update({ STATUS: "LULUS" }); // (Pastikan Anda punya kolom STATUS di master_siswa)
          
          totalSiswaDiproses += nisSiswaArray.length;
        }

      // --- KASUS 2: NAIK KELAS (ADA DAFTAR NIS) ---
      // Jika frontend mengirim daftar 'nisNaik'
      } else if (peta.nisNaik && peta.nisNaik.length > 0) {
        
        nisSiswaArray = peta.nisNaik; // <-- Kita pakai daftar dari frontend

        const dataBaru = {
            TINGKATAN_ID: peta.keTingkatan,
            JURUSAN_ID: peta.keJurusan,
            KELAS_ID: peta.keKelas,
            TAHUN_AJARAN_ID: taBaruId 
        };
        
        const jumlahSiswa = await SiswaKelasModel.prosesKenaikanRombel(
          nisSiswaArray, dataBaru, trx
        );
        totalSiswaDiproses += jumlahSiswa;

      // --- KASUS 3: TINGGAL KELAS (ADA DAFTAR NIS) ---
      // Jika frontend mengirim daftar 'nisTinggal'
      } else if (peta.nisTinggal && peta.nisTinggal.length > 0) {
        
        nisSiswaArray = peta.nisTinggal; // <-- Kita pakai daftar dari frontend

        const dataBaru = {
            TINGKATAN_ID: peta.keTingkatan,
            JURUSAN_ID: peta.keJurusan,
            KELAS_ID: peta.keKelas, // <-- Ini kelas XMA lagi
            TAHUN_AJARAN_ID: taBaruId // <-- Tapi di tahun ajaran baru
        };
        
        const jumlahSiswa = await SiswaKelasModel.prosesKenaikanRombel(
          nisSiswaArray, dataBaru, trx
        );
        totalSiswaDiproses += jumlahSiswa;
      }
      
    } // Akhir dari loop 'for'

    // 4. Jika semua loop berhasil, ubah status Tahun Ajaran
    // (Sesuai data Anda: 'Aktif' dan 'Tidak Aktif')
    await trx("master_tahun_ajaran")
      .where("TAHUN_AJARAN_ID", taLamaId)
      .update({ STATUS: "Tidak Aktif" });

    await trx("master_tahun_ajaran")
      .where("TAHUN_AJARAN_ID", taBaruId)
      .update({ STATUS: "Aktif" });

    // 5. Selesaikan Transaksi (Simpan permanen semua perubahan)
    await trx.commit();

    res.status(200).json({
      status: "00",
      message: `Proses Kenaikan Kelas berhasil. ${totalSiswaDiproses} siswa telah diproses.`,
    });

  } catch (error) {
    // 6. JIKA GAGAL
    // Batalkan semua perubahan dari database
    await trx.rollback();
    
    console.error("❌ Gagal total proses Kenaikan Kelas:", error);
    res.status(500).json({
      status: "99",
      message: "Proses Kenaikan Kelas Gagal: " + error.message,
    });
  }
};