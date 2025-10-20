import { db } from "../core/config/knex.js";

/**
 * Get all Info Sekolah
 */
export const getAllInfoSekolah = async () => {
  return db("master_infosekolah").select("*");
};

/**
 * Get Info Sekolah by INFO_ID
 */
export const getInfoSekolahById = async (INFO_ID) => {
  return db("master_infosekolah").where({ INFO_ID }).first();
};

/**
 * Create new Info Sekolah
 */
export const createInfoSekolah = async ({
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
  LAST_SYNC_DAPODIK,
}) => {
  if (!NAMA_SEKOLAH || !NPSN) {
    throw new Error("NAMA_SEKOLAH dan NPSN wajib diisi");
  }

  const [INFO_ID] = await db("master_infosekolah").insert({
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
    LAST_SYNC_DAPODIK,
  });
  return db("master_infosekolah").where({ INFO_ID }).first();
};

/**
 * Update Info Sekolah
 */
export const updateInfoSekolah = async (INFO_ID, data) => {
  if (!data.NAMA_SEKOLAH || !data.NPSN) {
    throw new Error("NAMA_SEKOLAH dan NPSN wajib diisi");
  }

  await db("master_infosekolah").where({ INFO_ID }).update(data);
  return db("master_infosekolah").where({ INFO_ID }).first();
};

/**
 * Delete Info Sekolah
 */
export const deleteInfoSekolah = async (INFO_ID) => {
  return db("master_infosekolah").where({ INFO_ID }).del();
};
