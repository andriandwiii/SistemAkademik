import { db } from "../core/config/knex.js";

// Ambil semua orang tua/wali berdasarkan siswa
export const getOrtuBySiswaId = async (siswaId) => {
  return db("m_orangtua_wali")
    .where("SISWA_ID", siswaId)
    .select("ORTU_ID", "SISWA_ID", "JENIS", "NAMA", "PEKERJAAN", "PENDIDIKAN", "ALAMAT", "NO_HP");
};

// Tambah orang tua/wali
export const addOrtu = async (data) => {
  const [id] = await db("m_orangtua_wali").insert({
    SISWA_ID: data.SISWA_ID,
    JENIS: data.JENIS,
    NAMA: data.NAMA,
    PEKERJAAN: data.PEKERJAAN,
    PENDIDIKAN: data.PENDIDIKAN,
    ALAMAT: data.ALAMAT,
    NO_HP: data.NO_HP,
  });

  return db("m_orangtua_wali")
    .where("ORTU_ID", id)
    .select("ORTU_ID", "SISWA_ID", "JENIS", "NAMA", "PEKERJAAN", "PENDIDIKAN", "ALAMAT", "NO_HP")
    .first();
};

// Update orang tua/wali
export const updateOrtu = async (id, data) => {
  await db("m_orangtua_wali")
    .where("ORTU_ID", id)
    .update({
      JENIS: data.JENIS,
      NAMA: data.NAMA,
      PEKERJAAN: data.PEKERJAAN,
      PENDIDIKAN: data.PENDIDIKAN,
      ALAMAT: data.ALAMAT,
      NO_HP: data.NO_HP,
      updated_at: db.fn.now(),
    });

  return db("m_orangtua_wali")
    .where("ORTU_ID", id)
    .select("ORTU_ID", "SISWA_ID", "JENIS", "NAMA", "PEKERJAAN", "PENDIDIKAN", "ALAMAT", "NO_HP")
    .first();
};

// Hapus orang tua/wali
export const deleteOrtu = async (id) => {
  const ortu = await db("m_orangtua_wali")
    .where("ORTU_ID", id)
    .first();
    
  if (!ortu) return null;

  await db("m_orangtua_wali")
    .where("ORTU_ID", id)
    .del();

  return ortu;
};
