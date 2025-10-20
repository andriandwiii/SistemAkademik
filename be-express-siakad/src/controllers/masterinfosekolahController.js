import * as MasterInfoSekolahModel from "../models/masterInfoSekolahModel.js";

/**
 * Ambil semua data Info Sekolah
 */
export const getAllInfoSekolah = async (req, res) => {
  try {
    const infoSekolah = await MasterInfoSekolahModel.getAllInfoSekolah();
    res.status(200).json(infoSekolah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil Info Sekolah berdasarkan INFO_ID
 */
export const getInfoSekolahById = async (req, res) => {
  try {
    const infoSekolah = await MasterInfoSekolahModel.getInfoSekolahById(req.params.INFO_ID);
    if (!infoSekolah) {
      return res.status(404).json({ message: "Info Sekolah tidak ditemukan" });
    }
    res.status(200).json(infoSekolah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah Info Sekolah baru
 */
export const createInfoSekolah = async (req, res) => {
  try {
    const {
      NAMA_SEKOLAH,
      NPSN,
      NSS,
      JENJANG_PENDIDIKAN,
      STATUS_SEKOLAH,
      VISI,
      MISI,
      MOTTO,
      ALAMAT_JALAN,
      RT,
      RW,
      KELURAHAN_DESA,
      KECAMATAN,
      KABUPATEN_KOTA,
      PROVINSI,
      KODE_POS,
      TELEPON,
      FAX,
      EMAIL,
      WEBSITE,
      AKREDITASI,
      NO_SK_AKREDITASI,
      TANGGAL_SK_AKREDITASI,
      TANGGAL_AKHIR_AKREDITASI,
      NAMA_KEPALA_SEKOLAH,
      NIP_KEPALA_SEKOLAH,
      EMAIL_KEPALA_SEKOLAH,
      NO_HP_KEPALA_SEKOLAH,
      PENYELENGGARA,
      NO_SK_PENDIRIAN,
      TANGGAL_SK_PENDIRIAN,
      NO_SK_IZIN_OPERASIONAL,
      TANGGAL_SK_IZIN_OPERASIONAL,
      LINTANG,
      BUJUR,
      LOGO_SEKOLAH_URL,
      NAMA_BANK,
      NOMOR_REKENING,
      NAMA_PEMILIK_REKENING,
      NPWP,
      KURIKULUM_DIGUNAKAN,
      WAKTU_PENYELENGGARAAN,
      SUMBER_LISTRIK,
      AKSES_INTERNET,
      NAMA_OPERATOR_DAPODIK,
      EMAIL_OPERATOR_DAPODIK,
      NO_HP_OPERATOR_DAPODIK,
      NAMA_KETUA_KOMITE,
      FACEBOOK_URL,
      INSTAGRAM_URL,
      TWITTER_X_URL,
      YOUTUBE_URL,
      IS_ACTIVE,
      LAST_SYNC_DAPODIK
    } = req.body;

    // Validasi data
    if (!NAMA_SEKOLAH || !NPSN) {
      return res.status(400).json({ message: "NAMA_SEKOLAH dan NPSN wajib diisi" });
    }

    const newInfoSekolah = await MasterInfoSekolahModel.createInfoSekolah({
      NAMA_SEKOLAH,
      NPSN,
      NSS,
      JENJANG_PENDIDIKAN,
      STATUS_SEKOLAH,
      VISI,
      MISI,
      MOTTO,
      ALAMAT_JALAN,
      RT,
      RW,
      KELURAHAN_DESA,
      KECAMATAN,
      KABUPATEN_KOTA,
      PROVINSI,
      KODE_POS,
      TELEPON,
      FAX,
      EMAIL,
      WEBSITE,
      AKREDITASI,
      NO_SK_AKREDITASI,
      TANGGAL_SK_AKREDITASI,
      TANGGAL_AKHIR_AKREDITASI,
      NAMA_KEPALA_SEKOLAH,
      NIP_KEPALA_SEKOLAH,
      EMAIL_KEPALA_SEKOLAH,
      NO_HP_KEPALA_SEKOLAH,
      PENYELENGGARA,
      NO_SK_PENDIRIAN,
      TANGGAL_SK_PENDIRIAN,
      NO_SK_IZIN_OPERASIONAL,
      TANGGAL_SK_IZIN_OPERASIONAL,
      LINTANG,
      BUJUR,
      LOGO_SEKOLAH_URL,
      NAMA_BANK,
      NOMOR_REKENING,
      NAMA_PEMILIK_REKENING,
      NPWP,
      KURIKULUM_DIGUNAKAN,
      WAKTU_PENYELENGGARAAN,
      SUMBER_LISTRIK,
      AKSES_INTERNET,
      NAMA_OPERATOR_DAPODIK,
      EMAIL_OPERATOR_DAPODIK,
      NO_HP_OPERATOR_DAPODIK,
      NAMA_KETUA_KOMITE,
      FACEBOOK_URL,
      INSTAGRAM_URL,
      TWITTER_X_URL,
      YOUTUBE_URL,
      IS_ACTIVE,
      LAST_SYNC_DAPODIK
    });

    res.status(201).json(newInfoSekolah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update Info Sekolah berdasarkan INFO_ID
 */
export const updateInfoSekolah = async (req, res) => {
  try {
    const { INFO_ID } = req.params;  // Mengambil INFO_ID dari URL params

    const updatedInfoSekolah = await MasterInfoSekolahModel.updateInfoSekolah(INFO_ID, req.body);

    if (!updatedInfoSekolah) {
      return res.status(404).json({ message: "Info Sekolah tidak ditemukan" });
    }

    res.status(200).json(updatedInfoSekolah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus Info Sekolah berdasarkan INFO_ID
 */
export const deleteInfoSekolah = async (req, res) => {
  try {
    const { INFO_ID } = req.params; // Mengambil INFO_ID dari URL params

    const deleted = await MasterInfoSekolahModel.deleteInfoSekolah(INFO_ID);

    if (!deleted) {
      return res.status(404).json({ message: "Info Sekolah tidak ditemukan" });
    }

    res.status(200).json({ message: "Info Sekolah berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
