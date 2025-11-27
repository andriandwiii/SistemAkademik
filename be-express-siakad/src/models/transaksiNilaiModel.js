import { db } from "../core/config/knex.js";

/* ===========================================================
 * GET MATA PELAJARAN DARI JADWAL BERDASARKAN KELAS
 * =========================================================== */
export const getMapelByKelas = async ({ KELAS_ID, TAHUN_AJARAN_ID }) => {
  const mapelList = await db("master_jadwal as j")
    .join("master_mata_pelajaran as mp", "j.KODE_MAPEL", "mp.KODE_MAPEL")
    .select(
      "mp.KODE_MAPEL",
      "mp.NAMA_MAPEL"
    )
    .where({
      "j.KELAS_ID": KELAS_ID,
      "j.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
    })
    .groupBy("mp.KODE_MAPEL", "mp.NAMA_MAPEL")
    .orderBy("mp.NAMA_MAPEL", "asc");

  return mapelList;
};

/* ===========================================================
 * GET ENTRY NILAI RAPOR
 * Mengambil:
 * 1. KKM dari transaksi_kkm + master_kkm
 * 2. Deskripsi predikat dari master_predikat
 * 3. Daftar siswa + nilai (jika sudah ada)
 * ===========================================================
 */
export const getEntryNilaiRapor = async ({
  KELAS_ID,
  KODE_MAPEL,
  TAHUN_AJARAN_ID,
  SEMESTER = "1"
}) => {

  /* -----------------------------------------------------------
   * 1. AMBIL KKM & DESKRIPSI PREDIKAT
   * ----------------------------------------------------------- */
  const settings = await db("transaksi_kkm as tk")
    .leftJoin("master_kkm as mk", "tk.KODE_KKM", "mk.KODE_KKM")
    .leftJoin("master_predikat as mp", function () {
      this.on("tk.KODE_MAPEL", "=", "mp.KODE_MAPEL")
          .andOn("tk.TAHUN_AJARAN_ID", "=", "mp.TAHUN_AJARAN_ID");
    })
    .select(
      "mk.KKM",
      "mp.DESKRIPSI_A",
      "mp.DESKRIPSI_B",
      "mp.DESKRIPSI_C",
      "mp.DESKRIPSI_D"
    )
    .where({
      "tk.KELAS_ID": KELAS_ID,
      "tk.KODE_MAPEL": KODE_MAPEL,
      "tk.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
    })
    .first();

  if (!settings) return null;

  /* -----------------------------------------------------------
   * 2. AMBIL SISWA DARI TRANSAKSI_SISWA_KELAS + NILAI
   * ----------------------------------------------------------- */
  const students = await db("transaksi_siswa_kelas as tsk")
    .join("master_siswa as s", "tsk.NIS", "s.NIS")
    .leftJoin("transaksi_nilai as tn", function () {
      this.on("s.NIS", "=", "tn.NIS")
        .andOn("tn.KODE_MAPEL", "=", db.raw("?", [KODE_MAPEL]))
        .andOn("tn.TAHUN_AJARAN_ID", "=", db.raw("?", [TAHUN_AJARAN_ID]))
        .andOn("tn.KELAS_ID", "=", db.raw("?", [KELAS_ID]))
        .andOn("tn.SEMESTER", "=", db.raw("?", [SEMESTER]));
    })
    .select(
      "s.NIS",
      "s.NISN",
      "s.NAMA",
      "tn.NILAI_P",
      "tn.NILAI_K"
    )
    .where({
      "tsk.KELAS_ID": KELAS_ID,
      "tsk.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
    })
    .orderBy("s.NAMA", "asc");

  return {
    kkm: settings.KKM || 75,
    deskripsi_template: {
      A: settings.DESKRIPSI_A || "Sangat Baik",
      B: settings.DESKRIPSI_B || "Baik",
      C: settings.DESKRIPSI_C || "Cukup",
      D: settings.DESKRIPSI_D || "Kurang"
    },
    siswa: students
  };
};

/* ===========================================================
 * SAVE/UPSERT NILAI SISWA
 * ===========================================================
 */
export const saveNilaiSiswa = async ({
  NIS,
  KELAS_ID,
  KODE_MAPEL,
  TAHUN_AJARAN_ID,
  SEMESTER,
  NILAI_P,
  NILAI_K
}) => {

  const existing = await db("transaksi_nilai")
    .where({
      NIS,
      KODE_MAPEL,
      KELAS_ID,
      TAHUN_AJARAN_ID,
      SEMESTER
    })
    .first();

  if (existing) {
    return db("transaksi_nilai")
      .where("ID", existing.ID)
      .update({
        NILAI_P,
        NILAI_K,
        updated_at: db.fn.now()
      });
  }

  return db("transaksi_nilai").insert({
    NIS,
    KELAS_ID,
    KODE_MAPEL,
    TAHUN_AJARAN_ID,
    SEMESTER,
    NILAI_P,
    NILAI_K
  });
};

/* ===========================================================
 * UPDATE NILAI BY ID
 * ===========================================================
 */
export const updateNilaiByIdModel = async (id, payload) => {
  return db("transaksi_nilai")
    .where("NIS", id)
    .update({
      NILAI_P: payload.nilai_p ?? null,
      NILAI_K: payload.nilai_k ?? null,
      updated_at: db.fn.now()
    });
};

/* ===========================================================
 * DELETE NILAI BY ID
 * ===========================================================
 */
export const deleteNilaiByIdModel = async (id) => {
  return db("transaksi_nilai")
    .where("NIS", id)
    .del();
};