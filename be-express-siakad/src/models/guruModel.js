import { db } from "../core/config/knex.js";

// 🔹 Ambil semua guru + data user + jabatan
export const getAllGuruWithUser = async () => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email")
    .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.KODE_JABATAN",
      "j.NAMA_JABATAN as JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.FOTO",
      "g.PENDIDIKAN_TERAKHIR",
      "g.TAHUN_LULUS",
      "g.UNIVERSITAS",
      "g.NO_SERTIFIKAT_PENDIDIK",
      "g.TAHUN_SERTIFIKAT",
      "g.KEAHLIAN",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    );
};

// 🔹 Ambil guru by ID + data user + jabatan
export const getGuruByIdWithUser = async (id) => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email")
    .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.KODE_JABATAN",
      "j.NAMA_JABATAN as JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.FOTO",
      "g.PENDIDIKAN_TERAKHIR",
      "g.TAHUN_LULUS",
      "g.UNIVERSITAS",
      "g.NO_SERTIFIKAT_PENDIDIK",
      "g.TAHUN_SERTIFIKAT",
      "g.KEAHLIAN",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("g.GURU_ID", id)
    .first();
};

// 🔹 Cari guru berdasarkan EMAIL (untuk filter dashboard)
export const getGuruByEmail = async (email) => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email")
    .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
    .where("g.EMAIL", email)
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.KODE_JABATAN",
      "j.NAMA_JABATAN as JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.FOTO",
      "g.PENDIDIKAN_TERAKHIR",
      "g.TAHUN_LULUS",
      "g.UNIVERSITAS",
      "g.NO_SERTIFIKAT_PENDIDIK",
      "g.TAHUN_SERTIFIKAT",
      "g.KEAHLIAN",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    );
};

// 🔹 Cari guru berdasarkan KODE_JABATAN
export const getGuruByJabatan = async (kodeJabatan) => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email")
    .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.KODE_JABATAN",
      "j.NAMA_JABATAN as JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.FOTO",
      "g.PENDIDIKAN_TERAKHIR",
      "g.TAHUN_LULUS",
      "g.UNIVERSITAS",
      "g.NO_SERTIFIKAT_PENDIDIK",
      "g.TAHUN_SERTIFIKAT",
      "g.KEAHLIAN",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("g.KODE_JABATAN", kodeJabatan)
    .andWhere("g.STATUS_KEPEGAWAIAN", "Aktif");
};

// 🔹 Cari guru berdasarkan NAMA jabatan
export const getGuruByNamaJabatan = async (nama_jabatan) => {
  return await db("master_guru as g")
    .join("master_jabatan as j", "g.KODE_JABATAN", "=", "j.KODE_JABATAN")
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.EMAIL",
      "g.STATUS_KEPEGAWAIAN",
      "g.NO_TELP",
      "j.KODE_JABATAN",
      "j.NAMA_JABATAN"
    )
    .where("j.NAMA_JABATAN", "like", `%${nama_jabatan}%`);
};

// 🔹 Tambah guru baru
export const addGuru = async ({
  NIP,
  NAMA,
  PANGKAT,
  KODE_JABATAN,
  STATUS_KEPEGAWAIAN,
  EMAIL,
  TGL_LAHIR,
  TEMPAT_LAHIR,
  GENDER,
  ALAMAT,
  NO_TELP,
  FOTO = null,
  PENDIDIKAN_TERAKHIR = null,
  TAHUN_LULUS = null,
  UNIVERSITAS = null,
  NO_SERTIFIKAT_PENDIDIK = null,
  TAHUN_SERTIFIKAT = null,
  KEAHLIAN = null
}) => {
  const [id] = await db("master_guru").insert({
    NIP,
    NAMA,
    PANGKAT,
    KODE_JABATAN: KODE_JABATAN || null,
    STATUS_KEPEGAWAIAN,
    EMAIL,
    TGL_LAHIR,
    TEMPAT_LAHIR,
    GENDER,
    ALAMAT,
    NO_TELP,
    FOTO,
    PENDIDIKAN_TERAKHIR,
    TAHUN_LULUS,
    UNIVERSITAS,
    NO_SERTIFIKAT_PENDIDIK,
    TAHUN_SERTIFIKAT,
    KEAHLIAN,
  });

  const guru = await getGuruByIdWithUser(id);

  if (guru && !guru.JABATAN && KODE_JABATAN) {
    const jabatan = await db("master_jabatan")
      .where("KODE_JABATAN", KODE_JABATAN)
      .first();
    if (jabatan) guru.JABATAN = jabatan.NAMA_JABATAN;
  }

  return guru;
};

// 🔹 Update data guru
export const updateGuru = async (
  id,
  {
    NIP,
    NAMA,
    PANGKAT,
    KODE_JABATAN,
    STATUS_KEPEGAWAIAN,
    EMAIL,
    TGL_LAHIR,
    TEMPAT_LAHIR,
    GENDER,
    ALAMAT,
    NO_TELP,
    FOTO,
    PENDIDIKAN_TERAKHIR,
    TAHUN_LULUS,
    UNIVERSITAS,
    NO_SERTIFIKAT_PENDIDIK,
    TAHUN_SERTIFIKAT,
    KEAHLIAN
  }
) => {
  await db("master_guru")
    .where({ GURU_ID: id })
    .update({
      NIP,
      NAMA,
      PANGKAT,
      KODE_JABATAN: KODE_JABATAN || null,
      STATUS_KEPEGAWAIAN,
      EMAIL,
      TGL_LAHIR,
      TEMPAT_LAHIR,
      GENDER,
      ALAMAT,
      NO_TELP,
      FOTO,
      PENDIDIKAN_TERAKHIR,
      TAHUN_LULUS,
      UNIVERSITAS,
      NO_SERTIFIKAT_PENDIDIK,
      TAHUN_SERTIFIKAT,
      KEAHLIAN,
      updated_at: db.fn.now(),
    });

  return getGuruByIdWithUser(id);
};

// 🔹 Hapus guru + user-nya
export const deleteGuru = async (id) => {
  const guru = await db("master_guru").where("GURU_ID", id).first();
  if (!guru) throw new Error("Guru tidak ditemukan");

  await db("master_guru").where("GURU_ID", id).del();

  if (guru.EMAIL) {
    await db("users").where("email", guru.EMAIL).del();
  }

  return guru;
};