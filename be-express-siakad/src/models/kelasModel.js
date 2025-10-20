import { db } from "../core/config/knex.js";

// ==========================
// Ambil semua kelas (JOIN)
// ==========================
export const getAllKelas = async () => {
  return db("m_kelas as k")
    .leftJoin("master_jurusan as j", "k.JURUSAN_ID", "j.JURUSAN_ID")
    .leftJoin("master_gedung as g", "k.GEDUNG_ID", "g.GEDUNG_ID")
    .leftJoin("master_tingkatan as t", "k.TINGKATAN_ID", "t.TINGKATAN_ID")
    .leftJoin("master_ruang_kelas as r", "k.RUANG_ID", "r.RUANG_ID")
    .select(
      "k.KELAS_ID",
      "k.JURUSAN_ID",
      "j.NAMA_JURUSAN",
      "k.GEDUNG_ID",
      "g.NAMA_GEDUNG",
      "k.TINGKATAN_ID",
      "t.TINGKATAN",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "k.created_at",
      "k.updated_at"
    )
    .orderBy("k.KELAS_ID", "asc");
};

// ==========================
// Ambil kelas berdasarkan ID
// ==========================
export const getKelasById = async (id) => {
  return db("m_kelas as k")
    .leftJoin("master_jurusan as j", "k.JURUSAN_ID", "j.JURUSAN_ID")
    .leftJoin("master_gedung as g", "k.GEDUNG_ID", "g.GEDUNG_ID")
    .leftJoin("master_tingkatan as t", "k.TINGKATAN_ID", "t.TINGKATAN_ID")
    .leftJoin("master_ruang_kelas as r", "k.RUANG_ID", "r.RUANG_ID")
    .where("k.KELAS_ID", id)
    .select(
      "k.KELAS_ID",
      "k.JURUSAN_ID",
      "j.NAMA_JURUSAN",
      "k.GEDUNG_ID",
      "g.NAMA_GEDUNG",
      "k.TINGKATAN_ID",
      "t.TINGKATAN",
      "k.RUANG_ID",
      "r.NAMA_RUANG",
      "k.created_at",
      "k.updated_at"
    )
    .first();
};

// ==========================
// Tambah kelas baru 
// ==========================
export const addKelas = async ({ jurusan_id, gedung_id, tingkatan_id, ruang_id }) => {
  try {
    const [KELAS_ID] = await db("m_kelas").insert({
      JURUSAN_ID: jurusan_id,
      GEDUNG_ID: gedung_id,
      TINGKATAN_ID: tingkatan_id,
      RUANG_ID: ruang_id,
    });

    return getKelasById(KELAS_ID);
  } catch (error) {
    console.error("Gagal menambahkan kelas:", error);
    throw new Error("Gagal menambahkan kelas ke database");
  }
};

// ==========================
// Update kelas
// ==========================
export const updateKelas = async (id, { jurusan_id, gedung_id, tingkatan_id, ruang_id }) => {
  const affected = await db("m_kelas")
    .where({ KELAS_ID: id })
    .update({
      JURUSAN_ID: jurusan_id,
      GEDUNG_ID: gedung_id,
      TINGKATAN_ID: tingkatan_id,
      RUANG_ID: ruang_id,
      updated_at: db.fn.now(),
    });

  if (!affected) return null;
  return getKelasById(id);
};

// ==========================
// Hapus kelas
// ==========================
export const removeKelas = async (id) => {
  const affected = await db("m_kelas").where({ KELAS_ID: id }).del();
  return affected > 0;
};
