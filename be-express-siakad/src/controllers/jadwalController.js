import * as JadwalModel from "../models/jadwalModel.js";

/** 🔹 Ambil semua jadwal */
export const getAllJadwal = async (req, res) => {
  try {
    const data = await JadwalModel.getAllJadwal();
    res.status(200).json({
      status: "00",
      message: "Data jadwal berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllJadwal:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah jadwal baru (KODE_JADWAL generate otomatis) */
export const createJadwal = async (req, res) => {
  try {
    const { HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP } = req.body;

    // Cek field wajib
    if (!HARI || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !NIP || !KODE_MAPEL || !KODE_JP) {
      return res.status(400).json({
        status: "01", // Ganti ke 01 untuk konsistensi error
        message:
          "Semua field wajib diisi (HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP)",
      });
    }

    // --- 🛡️ VALIDASI BENTROK ---
    const bentrok = await JadwalModel.checkBentrok({
      HARI,
      KODE_JP,
      NIP,
      KELAS_ID,
    });

    if (bentrok) {
      let message;
      // Cek apakah bentrok karena guru atau karena kelas
      if (bentrok.NIP === NIP) {
        message = `Validasi Gagal: Guru (NIP: ${NIP}) sudah mengajar di kelas lain (ID Kelas: ${bentrok.KELAS_ID}) pada hari dan jam yang sama.`;
      } else {
        message = `Validasi Gagal: Kelas (ID: ${KELAS_ID}) sudah memiliki jadwal lain (Guru NIP: ${bentrok.NIP}) pada hari dan jam yang sama.`;
      }
      // Kirim status 400 (Bad Request)
      return res.status(400).json({ status: "01", message });
    }
    // --- AKHIR VALIDASI ---

    const result = await JadwalModel.createJadwal({
      HARI,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      NIP,
      KODE_MAPEL,
      KODE_JP,
    });

    res.status(201).json({
      status: "00",
      message: "Jadwal berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error createJadwal:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update jadwal */
export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP } = req.body;

    // Cek field wajib
    if (!HARI || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !NIP || !KODE_MAPEL || !KODE_JP) {
      return res.status(400).json({
        status: "01", // Ganti ke 01 untuk konsistensi error
        message:
          "Semua field wajib diisi (HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP)",
      });
    }

    // --- 🛡️ VALIDASI BENTROK ---
    const bentrok = await JadwalModel.checkBentrok({
      HARI,
      KODE_JP,
      NIP,
      KELAS_ID,
      excludeId: id, // <-- PENTING: ID jadwal ini dikecualikan dari pengecekan
    });

    if (bentrok) {
      let message;
      if (bentrok.NIP === NIP) {
        message = `Validasi Gagal: Guru (NIP: ${NIP}) sudah mengajar di kelas lain (ID Kelas: ${bentrok.KELAS_ID}) pada hari dan jam yang sama.`;
      } else {
        message = `Validasi Gagal: Kelas (ID: ${KELAS_ID}) sudah memiliki jadwal lain (Guru NIP: ${bentrok.NIP}) pada hari dan jam yang sama.`;
      }
      return res.status(400).json({ status: "01", message });
    }
    // --- AKHIR VALIDASI ---

    const updated = await JadwalModel.updateJadwal(id, {
      HARI,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      NIP,
      KODE_MAPEL,
      KODE_JP,
    });

    if (!updated) {
      return res.status(404).json({
        status: "01", // Ganti ke 01
        message: "Jadwal tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Jadwal berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updateJadwal:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Hapus jadwal */
export const deleteJadwal = async (req, res) => {
  try {
    const deleted = await JadwalModel.deleteJadwal(req.params.id);
    if (!deleted)
      return res.status(404).json({
        status: "01", // Ganti ke 01
        message: "Jadwal tidak ditemukan",
      });

    res.status(200).json({
      status: "00",
      message: "Jadwal berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteJadwal:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};