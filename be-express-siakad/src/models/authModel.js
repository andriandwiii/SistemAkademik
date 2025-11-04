import { db } from "../core/config/knex.js";
import { addUser } from "./userModel.js";
import { hashPassword } from "../utils/hash.js";

/**
 * CREATE GURU
 */
export const createGuru = async (guruData, userData) => {
  const hashedPassword = await hashPassword(userData.password);

  // Tambah user
  const user = await addUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: "GURU",
  });

  // Tambah guru
  const [guruId] = await db("master_guru").insert({
    EMAIL: guruData.EMAIL,
    NIP: guruData.NIP,
    NAMA: guruData.NAMA,
    PANGKAT: guruData.PANGKAT,
    KODE_JABATAN: guruData.KODE_JABATAN,
    STATUS_KEPEGAWAIAN: guruData.STATUS_KEPEGAWAIAN,
    GENDER: guruData.GENDER,
    TGL_LAHIR: guruData.TGL_LAHIR,
    TEMPAT_LAHIR: guruData.TEMPAT_LAHIR,
    NO_TELP: guruData.NO_TELP,
    ALAMAT: guruData.ALAMAT,
    FOTO: guruData.FOTO,
    PENDIDIKAN_TERAKHIR: guruData.PENDIDIKAN_TERAKHIR,
    TAHUN_LULUS: guruData.TAHUN_LULUS,
    UNIVERSITAS: guruData.UNIVERSITAS,
    NO_SERTIFIKAT_PENDIDIK: guruData.NO_SERTIFIKAT_PENDIDIK,
    TAHUN_SERTIFIKAT: guruData.TAHUN_SERTIFIKAT,
    KEAHLIAN: guruData.KEAHLIAN,
  });

  const guru = await db("master_guru").where({ GURU_ID: guruId }).first();

  return { user, guru };
};

/**
 * CREATE SISWA (dengan transaksi)
 */
export const createSiswa = async (siswaData, userData) => {
  const hashedPassword = await hashPassword(userData.password);

  return await db.transaction(async (trx) => {
    // Insert user
    const [userId] = await trx("users").insert({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: "SISWA",
    });

    // Insert siswa
    const [siswaId] = await trx("master_siswa").insert({
      EMAIL: siswaData.EMAIL,
      NIS: siswaData.NIS,
      NISN: siswaData.NISN,
      NAMA: siswaData.NAMA,
      GENDER: siswaData.GENDER,
      TEMPAT_LAHIR: siswaData.TEMPAT_LAHIR,
      TGL_LAHIR: siswaData.TGL_LAHIR,
      AGAMA: siswaData.AGAMA,
      ALAMAT: siswaData.ALAMAT,
      NO_TELP: siswaData.NO_TELP,
      STATUS: siswaData.STATUS,
      GOL_DARAH: siswaData.GOL_DARAH,
      TINGGI: siswaData.TINGGI,
      BERAT: siswaData.BERAT,
      KEBUTUHAN_KHUSUS: siswaData.KEBUTUHAN_KHUSUS,
      FOTO: siswaData.FOTO,
      // Orang tua
      NAMA_AYAH: siswaData.NAMA_AYAH,
      PEKERJAAN_AYAH: siswaData.PEKERJAAN_AYAH,
      PENDIDIKAN_AYAH: siswaData.PENDIDIKAN_AYAH,
      ALAMAT_AYAH: siswaData.ALAMAT_AYAH,
      NO_TELP_AYAH: siswaData.NO_TELP_AYAH,
      NAMA_IBU: siswaData.NAMA_IBU,
      PEKERJAAN_IBU: siswaData.PEKERJAAN_IBU,
      PENDIDIKAN_IBU: siswaData.PENDIDIKAN_IBU,
      ALAMAT_IBU: siswaData.ALAMAT_IBU,
      NO_TELP_IBU: siswaData.NO_TELP_IBU,
      NAMA_WALI: siswaData.NAMA_WALI,
      PEKERJAAN_WALI: siswaData.PEKERJAAN_WALI,
      PENDIDIKAN_WALI: siswaData.PENDIDIKAN_WALI,
      ALAMAT_WALI: siswaData.ALAMAT_WALI,
      NO_TELP_WALI: siswaData.NO_TELP_WALI,
    });

    return { userId, siswaId };
  });
};

/**
 * CHECK EMAIL EXISTS
 */
export const checkEmailExists = async (email) => {
  return await db("users").where({ email }).first();
};

/**
 * CHECK NIS EXISTS
 */
export const checkNisExists = async (nis) => {
  return await db("master_siswa").where({ NIS: nis }).first();
};

/**
 * CHECK NISN EXISTS
 */
export const checkNisnExists = async (nisn) => {
  return await db("master_siswa").where({ NISN: nisn }).first();
};

/**
 * COUNT SUPER ADMIN
 */
export const countSuperAdmin = async () => {
  const result = await db("users").where({ role: "SUPER_ADMIN" }).count("id as total");
  return result[0].total;
};

/**
 * GET USER PROFILE WITH DETAILS
 */
export const getUserProfileById = async (userId) => {
  const user = await db("users")
    .where({ id: userId })
    .select("id", "name", "email", "role", "created_at")
    .first();

  if (!user) return null;

  // Jika GURU, ambil data guru
  if (user.role === "GURU") {
    const guruData = await db("master_guru as g")
      .leftJoin("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
      .where("g.EMAIL", user.email)
      .select(
        "g.GURU_ID",
        "g.NIP",
        "g.NAMA",
        "g.PANGKAT",
        "g.KODE_JABATAN",
        "j.NAMA_JABATAN as JABATAN",
        "g.STATUS_KEPEGAWAIAN",
        "g.GENDER",
        "g.TGL_LAHIR",
        "g.TEMPAT_LAHIR",
        "g.ALAMAT",
        "g.NO_TELP",
        "g.FOTO",
        "g.KEAHLIAN"
      )
      .first();

    return { ...user, guru: guruData };
  }

  // Jika SISWA, ambil data siswa + transaksi kelas
  if (user.role === "SISWA") {
    const siswaData = await db("master_siswa")
      .where("EMAIL", user.email)
      .select(
        "SISWA_ID",
        "NIS",
        "NISN",
        "NAMA",
        "GENDER",
        "TGL_LAHIR",
        "TEMPAT_LAHIR",
        "AGAMA",
        "ALAMAT",
        "NO_TELP",
        "STATUS",
        "GOL_DARAH",
        "TINGGI",
        "BERAT",
        "KEBUTUHAN_KHUSUS",
        "FOTO",
        "NAMA_AYAH",
        "PEKERJAAN_AYAH",
        "PENDIDIKAN_AYAH",
        "ALAMAT_AYAH",
        "NO_TELP_AYAH",
        "NAMA_IBU",
        "PEKERJAAN_IBU",
        "PENDIDIKAN_IBU",
        "ALAMAT_IBU",
        "NO_TELP_IBU",
        "NAMA_WALI",
        "PEKERJAAN_WALI",
        "PENDIDIKAN_WALI",
        "ALAMAT_WALI",
        "NO_TELP_WALI"
      )
      .first();

    if (siswaData) {
      const transaksiKelas = await db("transaksi_siswa_kelas as t")
        .leftJoin("master_tingkatan as ti", "t.TINGKATAN_ID", "ti.TINGKATAN_ID")
        .leftJoin("master_jurusan as j", "t.JURUSAN_ID", "j.JURUSAN_ID")
        .leftJoin("master_kelas as k", "t.KELAS_ID", "k.KELAS_ID")
        .leftJoin("master_ruang as r", "k.RUANG_ID", "r.RUANG_ID")
        .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
        .where("t.NIS", siswaData.NIS)
        .select(
          "t.TRANSAKSI_ID",
          "t.KELAS_ID",
          "t.TINGKATAN_ID",
          "t.JURUSAN_ID",
          "t.TAHUN_AJARAN_ID",
          "ti.TINGKATAN",
          "j.NAMA_JURUSAN",
          "k.GEDUNG_ID",
          "k.RUANG_ID",
          "r.NAMA_RUANG",
          "ta.NAMA_TAHUN_AJARAN"
        )
        .orderBy("t.created_at", "desc");

      siswaData.transaksi_siswa_kelas = transaksiKelas.map((t) => ({
        TRANSAKSI_ID: t.TRANSAKSI_ID,
        KELAS_ID: t.KELAS_ID,
        TINGKATAN_ID: t.TINGKATAN_ID,
        JURUSAN_ID: t.JURUSAN_ID,
        TAHUN_AJARAN_ID: t.TAHUN_AJARAN_ID,
        tingkatan: {
          TINGKATAN_ID: t.TINGKATAN_ID,
          TINGKATAN: t.TINGKATAN,
        },
        jurusan: {
          JURUSAN_ID: t.JURUSAN_ID,
          NAMA_JURUSAN: t.NAMA_JURUSAN,
        },
        kelas: {
          KELAS_ID: t.KELAS_ID,
          GEDUNG_ID: t.GEDUNG_ID,
          RUANG_ID: t.RUANG_ID,
          NAMA_RUANG: t.NAMA_RUANG,
        },
        tahun_ajaran: {
          TAHUN_AJARAN_ID: t.TAHUN_AJARAN_ID,
          NAMA_TAHUN_AJARAN: t.NAMA_TAHUN_AJARAN,
        },
      }));
    }

    return { ...user, siswa: siswaData };
  }

  return user;
};

/**
 * BLACKLIST TOKEN
 */
export const blacklistToken = async (token, expiredAt) => {
  return await db("blacklist_tokens").insert({
    token,
    expired_at: expiredAt,
  });
};