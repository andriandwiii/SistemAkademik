import { db } from "../core/config/knex.js"; // pastikan path knex.js benar

// Ambil semua guru + data user
export const getAllGuruWithUser = async () => {
  return db("m_guru as g")
    .leftJoin("users as u", "g.user_id", "u.id")
    .select(
      "g.GURU_ID",
      "g.user_id",
      "g.NIP",
      "g.NAMA",
      "g.GELAR_DEPAN",
      "g.GELAR_BELAKANG",
      "g.PANGKAT",
      "g.JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.email as user_email",
      "u.role as user_role"
    );
};

// Ambil guru by ID + data user
export const getGuruByIdWithUser = async (id) => {
  return db("m_guru as g")
    .leftJoin("users as u", "g.user_id", "u.id")
    .select(
      "g.GURU_ID",
      "g.user_id",
      "g.NIP",
      "g.NAMA",
      "g.GELAR_DEPAN",
      "g.GELAR_BELAKANG",
      "g.PANGKAT",
      "g.JABATAN",
      "g.STATUS_KEPEGAWAIAN",
      "g.EMAIL",
      "g.TGL_LAHIR",
      "g.TEMPAT_LAHIR",
      "g.GENDER",
      "g.ALAMAT",
      "g.NO_TELP",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.email as user_email",
      "u.role as user_role"
    )
    .where("g.GURU_ID", id)
    .first();
};

// Tambah guru baru
export const addGuru = async ({
  user_id,
  NIP,
  NAMA,
  GELAR_DEPAN,
  GELAR_BELAKANG,
  PANGKAT,
  JABATAN,
  STATUS_KEPEGAWAIAN,
  EMAIL,
  TGL_LAHIR,
  TEMPAT_LAHIR,
  GENDER,
  ALAMAT,
  NO_TELP
}) => {
  const [id] = await db("m_guru").insert({
    user_id,
    NIP,
    NAMA,
    GELAR_DEPAN,
    GELAR_BELAKANG,
    PANGKAT,
    JABATAN,
    STATUS_KEPEGAWAIAN,
    EMAIL,
    TGL_LAHIR,
    TEMPAT_LAHIR,
    GENDER,
    ALAMAT,
    NO_TELP
  });

  return getGuruByIdWithUser(id);
};

// Update data guru
export const updateGuru = async (
  id,
  {
    NIP,
    NAMA,
    GELAR_DEPAN,
    GELAR_BELAKANG,
    PANGKAT,
    JABATAN,
    STATUS_KEPEGAWAIAN,
    EMAIL,
    TGL_LAHIR,
    TEMPAT_LAHIR,
    GENDER,
    ALAMAT,
    NO_TELP
  }
) => {
  await db("m_guru")
    .where({ GURU_ID: id })
    .update({
      NIP,
      NAMA,
      GELAR_DEPAN,
      GELAR_BELAKANG,
      PANGKAT,
      JABATAN,
      STATUS_KEPEGAWAIAN,
      EMAIL,
      TGL_LAHIR,
      TEMPAT_LAHIR,
      GENDER,
      ALAMAT,
      NO_TELP
      // ❌ tidak perlu set updated_at manual
    });

  return getGuruByIdWithUser(id);
};

// Hapus guru

export const deleteGuru = async (id) => {
  // Cari guru untuk ambil user_id
  const guru = await db("m_guru").where("GURU_ID", id).first();
  if (!guru) throw new Error("Guru tidak ditemukan");

  // Hapus guru
  await db("m_guru").where("GURU_ID", id).del();

  // Hapus user juga jika ada relasi
  if (guru.user_id) {
    await db("users").where("id", guru.user_id).del();
  }

  return guru;
};
