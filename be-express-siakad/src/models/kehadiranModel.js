import { db } from "../core/config/knex.js";

/**
 * Mengambil daftar siswa berdasarkan kelas dan tahun ajaran
 * Menggunakan LEFT JOIN agar siswa yang belum diabsen tetap muncul (nilai 0)
 */
export const getKehadiranSiswaByKelas = async ({ KELAS_ID, TAHUN_AJARAN_ID, SEMESTER }) => {
  return await db("transaksi_siswa_kelas as tsk")
    .join("master_siswa as s", "tsk.NIS", "s.NIS")
    .leftJoin("transaksi_kehadiran as tk", function () {
      this.on("s.NIS", "=", "tk.NIS")
        .andOn("tk.KELAS_ID", "=", "tsk.KELAS_ID")
        .andOn("tk.TAHUN_AJARAN_ID", "=", "tsk.TAHUN_AJARAN_ID")
        .andOn("tk.SEMESTER", "=", db.raw("?", [SEMESTER]));
    })
    .select(
      "s.NIS",
      "s.NAMA",
      db.raw("COALESCE(tk.SAKIT, 0) as SAKIT"),
      db.raw("COALESCE(tk.IZIN, 0) as IZIN"),
      db.raw("COALESCE(tk.ALPA, 0) as ALPA")
    )
    .where({
      "tsk.KELAS_ID": KELAS_ID,
      "tsk.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
    })
    .orderBy("s.NAMA", "asc");
};

/**
 * Menyimpan data (Insert jika baru, Update jika sudah ada)
 */
export const saveKehadiranSiswaModel = async (data) => {
  const { NIS, KELAS_ID, TAHUN_AJARAN_ID, SEMESTER, SAKIT, IZIN, ALPA } = data;
  
  const existing = await db("transaksi_kehadiran")
    .where({ NIS, KELAS_ID, TAHUN_AJARAN_ID, SEMESTER })
    .first();

  if (existing) {
    return db("transaksi_kehadiran")
      .where("ID", existing.ID)
      .update({
        SAKIT,
        IZIN,
        ALPA,
        updated_at: db.fn.now()
      });
  }

  return db("transaksi_kehadiran").insert({
    ...data,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
};

/**
 * Menghapus data kehadiran spesifik satu siswa
 */
export const deleteKehadiranModel = async ({ NIS, KELAS_ID, TAHUN_AJARAN_ID, SEMESTER }) => {
  return db("transaksi_kehadiran")
    .where({ NIS, KELAS_ID, TAHUN_AJARAN_ID, SEMESTER })
    .del();
};