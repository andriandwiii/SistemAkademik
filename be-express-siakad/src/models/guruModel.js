import { db } from "../core/config/knex.js"; // pastikan path knex.js benar

// Ambil semua guru + data user
export const getAllGuruWithUser = async () => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email") // relasi pakai email, bukan user_id
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.JABATAN",
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
      "g.MAPEL_DIAMPU",
      "g.created_at",
      "g.updated_at",
      "u.name as user_name",
      "u.email as user_email",
      "u.role as user_role"
    );
};

// Ambil guru by ID + data user
export const getGuruByIdWithUser = async (id) => {
  return db("master_guru as g")
    .leftJoin("users as u", "g.EMAIL", "u.email")
    .select(
      "g.GURU_ID",
      "g.NIP",
      "g.NAMA",
      "g.PANGKAT",
      "g.JABATAN",
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
      "g.MAPEL_DIAMPU",
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
  NIP,
  NAMA,
  PANGKAT,
  JABATAN,
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
  MAPEL_DIAMPU = null
}) => {
  const [id] = await db("master_guru").insert({
    NIP,
    NAMA,
    PANGKAT,
    JABATAN,
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
    MAPEL_DIAMPU
  });

  return getGuruByIdWithUser(id);
};


// Update data guru
export const updateGuru = async (
  id,
  {
    NIP,
    NAMA,
    PANGKAT,
    JABATAN,
    STATUS_KEPEGAWAIAN,
    EMAIL,
    TGL_LAHIR,
    TEMPAT_LAHIR,
    GENDER,
    ALAMAT,
    NO_TELP,
    FOTO,
    PENDIDIKAN_TERAKHIR,
    UNIVERSITAS,
    NO_SERTIFIKAT_PENDIDIK,
    MAPEL_DIAMPU
  }
) => {
  await db("master_guru")
    .where({ GURU_ID: id })
    .update({
      NIP,
      NAMA,
      PANGKAT,
      JABATAN,
      STATUS_KEPEGAWAIAN,
      EMAIL,
      TGL_LAHIR,
      TEMPAT_LAHIR,
      GENDER,
      ALAMAT,
      NO_TELP,
      FOTO,
      PENDIDIKAN_TERAKHIR,
      UNIVERSITAS,
      NO_SERTIFIKAT_PENDIDIK,
      MAPEL_DIAMPU
    });

  return getGuruByIdWithUser(id);
};

// Hapus guru
export const deleteGuru = async (id) => {
  const guru = await db("master_guru").where("GURU_ID", id).first();
  if (!guru) throw new Error("Guru tidak ditemukan");

  await db("master_guru").where("GURU_ID", id).del();

  // Hapus user juga jika ada relasi lewat email
  if (guru.EMAIL) {
    await db("users").where("email", guru.EMAIL).del();
  }

  return guru;
};
