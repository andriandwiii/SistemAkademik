import { db } from "../core/config/knex.js"; // Pastikan path knex.js benar

// Ambil semua siswa + data user
export const getAllSiswaWithUser = async () => {
  const siswaList = await db("m_siswa as s")
    .leftJoin("users as u", "s.user_id", "u.id")
    .select(
      "s.SISWA_ID",
      "s.user_id",
      "s.NIS",
      "s.NISN",
      "s.NAMA",
      "s.GENDER",
      "s.TEMPAT_LAHIR",
      "s.TGL_LAHIR",
      "s.AGAMA",
      "s.ALAMAT",
      "s.NO_TELP",
      "s.EMAIL",
      "s.STATUS",
      "s.GOL_DARAH",
      "s.TINGGI",
      "s.BERAT",
      "s.KEBUTUHAN_KHUSUS",
      "s.FOTO",
      "u.name as user_name",
      "u.email as user_email",
      "u.role as user_role"
    );

  // Tambahkan orang_tua untuk setiap siswa
  for (const siswa of siswaList) {
    const orangTua = await db("m_orangtua_wali")
      .where("SISWA_ID", siswa.SISWA_ID)
      .select("JENIS", "NAMA", "PEKERJAAN", "PENDIDIKAN", "ALAMAT", "NO_HP");

    siswa.orang_tua = orangTua;
  }

  return siswaList;
};

// Ambil siswa by ID + data user + orang tua/wali
export const getSiswaByIdWithUser = async (id) => {
  const siswa = await db("m_siswa as s")
    .leftJoin("users as u", "s.user_id", "u.id")
    .select(
      "s.SISWA_ID",
      "s.user_id",
      "s.NIS",
      "s.NISN",
      "s.NAMA",
      "s.GENDER",
      "s.TEMPAT_LAHIR",
      "s.TGL_LAHIR",
      "s.AGAMA",
      "s.ALAMAT",
      "s.NO_TELP",
      "s.EMAIL",
      "s.STATUS",
      "s.GOL_DARAH",
      "s.TINGGI",
      "s.BERAT",
      "s.KEBUTUHAN_KHUSUS",
      "s.FOTO",
      "u.name as user_name",
      "u.email as user_email",
      "u.role as user_role"
    )
    .where("s.SISWA_ID", id)
    .first();

  if (!siswa) return null;

  const orangTua = await db("m_orangtua_wali")
    .where("SISWA_ID", id)
    .select("JENIS", "NAMA", "PEKERJAAN", "PENDIDIKAN", "ALAMAT", "NO_HP");

  siswa.orang_tua = orangTua;

  return siswa;
};

// Tambah siswa baru
export const addSiswa = async (data) => {
  const [id] = await db("m_siswa").insert({
    user_id: data.user_id,
    NIS: data.NIS,
    NISN: data.NISN,
    NAMA: data.NAMA,
    GENDER: data.GENDER,
    TEMPAT_LAHIR: data.TEMPAT_LAHIR,
    TGL_LAHIR: data.TGL_LAHIR,
    AGAMA: data.AGAMA,
    ALAMAT: data.ALAMAT,
    NO_TELP: data.NO_TELP,
    EMAIL: data.EMAIL,
    STATUS: data.STATUS,
    GOL_DARAH: data.GOL_DARAH,
    TINGGI: data.TINGGI,
    BERAT: data.BERAT,
    KEBUTUHAN_KHUSUS: data.KEBUTUHAN_KHUSUS,
    FOTO: data.FOTO,
  });

  return getSiswaByIdWithUser(id);
};

// Update siswa
export const updateSiswa = async (id, data) => {
  await db("m_siswa").where({ SISWA_ID: id }).update({
    NIS: data.NIS,
    NISN: data.NISN,
    NAMA: data.NAMA,
    GENDER: data.GENDER,
    TEMPAT_LAHIR: data.TEMPAT_LAHIR,
    TGL_LAHIR: data.TGL_LAHIR,
    AGAMA: data.AGAMA,
    ALAMAT: data.ALAMAT,
    NO_TELP: data.NO_TELP,
    EMAIL: data.EMAIL,
    STATUS: data.STATUS,
    GOL_DARAH: data.GOL_DARAH,
    TINGGI: data.TINGGI,
    BERAT: data.BERAT,
    KEBUTUHAN_KHUSUS: data.KEBUTUHAN_KHUSUS,
    FOTO: data.FOTO,
    updated_at: db.fn.now(),
  });

  return getSiswaByIdWithUser(id);
};

// Hapus siswa beserta user dan orang tua/wali
export const deleteSiswa = async (id) => {
  const siswa = await db("m_siswa").where("SISWA_ID", id).first();
  if (!siswa) return null;

  // Hapus data orang tua/wali
  await db("m_orangtua_wali").where("SISWA_ID", id).del();

  // Hapus data siswa
  await db("m_siswa").where("SISWA_ID", id).del();

  // Hapus user login
  if (siswa.user_id) {
    await db("users").where("id", siswa.user_id).del();
  }

  return siswa;
};
