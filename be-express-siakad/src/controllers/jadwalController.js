import * as JadwalModel from "../models/jadwalModel.js";

// 🛠️ HELPER: Fungsi Validasi Input & Cek Bentrok
// Fungsi ini dipisahkan agar bisa dipakai oleh Create maupun Update
const validateJadwal = async (data, isUpdate = false, id = null) => {
  const { HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP, TAHUN_AJARAN_ID } = data;

  // 1. Cek Field Wajib
  if (!HARI || !TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !NIP || !KODE_MAPEL || !KODE_JP || !TAHUN_AJARAN_ID) {
    // Kita throw error object agar bisa ditangkap di catch block controller
    throw {
      status: 400,
      customStatus: "01",
      message: "Semua field wajib diisi (HARI, TINGKATAN_ID, JURUSAN_ID, KELAS_ID, NIP, KODE_MAPEL, KODE_JP, TAHUN_AJARAN_ID)",
    };
  }

  // 2. Cek Bentrok ke Database
  const checkParams = {
    HARI,
    KODE_JP,
    NIP,
    KELAS_ID,
    TAHUN_AJARAN_ID,
    // Jika sedang update, kita kirim ID jadwal ini agar tidak dianggap bentrok dengan dirinya sendiri
    ...(isUpdate && { excludeId: id }), 
  };

  const bentrok = await JadwalModel.checkBentrok(checkParams);

  // Jika ada data bentrok dan tahun ajarannya sama
  if (bentrok && bentrok.TAHUN_AJARAN_ID === TAHUN_AJARAN_ID) {
    let message;
    if (bentrok.NIP === NIP) {
      message = `Validasi Gagal: Guru (NIP: ${NIP}) sudah mengajar di kelas lain (ID Kelas: ${bentrok.KELAS_ID}) pada hari & jam yang sama.`;
    } else {
      message = `Validasi Gagal: Kelas (ID: ${KELAS_ID}) sudah memiliki jadwal lain (Guru NIP: ${bentrok.NIP}) pada hari & jam yang sama.`;
    }
    // Throw error bentrok
    throw { status: 400, customStatus: "01", message };
  }
};

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

/** 🔹 Tambah jadwal baru */
export const createJadwal = async (req, res) => {
  try {
    // 1. Panggil Helper Validasi
    await validateJadwal(req.body);

    // 2. Jika lolos, simpan data
    const result = await JadwalModel.createJadwal(req.body);

    res.status(201).json({
      status: "00",
      message: "Jadwal berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    // Tangkap error custom dari helper (status 400) atau error server (status 500)
    if (err.customStatus) {
      return res.status(err.status).json({ status: err.customStatus, message: err.message });
    }
    console.error("❌ Error createJadwal:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update jadwal */
export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Panggil Helper Validasi (Mode Update = true, sertakan ID)
    await validateJadwal(req.body, true, id);

    // 2. Update data
    const updated = await JadwalModel.updateJadwal(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "01",
        message: "Jadwal tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Jadwal berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    if (err.customStatus) {
      return res.status(err.status).json({ status: err.customStatus, message: err.message });
    }
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
        status: "01",
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