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
 * GET ENTRY NILAI RAPOR (UPDATED - Predikat per Mapel)
 * Mengambil:
 * 1. KKM langsung dari master_kkm via jadwal
 * 2. Deskripsi predikat dari master_predikat (per mapel + tahun)
 * 3. Daftar siswa + nilai
 * ===========================================================
 */
export const getEntryNilaiRapor = async ({
  KELAS_ID,
  KODE_MAPEL,
  TAHUN_AJARAN_ID,
  SEMESTER = "1"
}) => {

  /* -----------------------------------------------------------
   * 1. AMBIL KKM DARI master_kkm (via jadwal)
   * ----------------------------------------------------------- */
  const kkmData = await db("master_jadwal as mj")
    .join("master_kkm as mk", function() {
      this.on("mk.KODE_MAPEL", "=", "mj.KODE_MAPEL")
          .andOn("mk.TAHUN_AJARAN_ID", "=", "mj.TAHUN_AJARAN_ID");
    })
    .select(
      "mk.KKM",
      "mk.KOMPLEKSITAS",
      "mk.DAYA_DUKUNG",
      "mk.INTAKE"
    )
    .where({
      "mj.KELAS_ID": KELAS_ID,
      "mj.KODE_MAPEL": KODE_MAPEL,
      "mj.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
    })
    .first();

  if (!kkmData) {
    return null; // KKM belum di-set untuk mapel ini
  }

  /* -----------------------------------------------------------
   * 2. ✅ AMBIL PREDIKAT TEMPLATE (PER MAPEL + TAHUN AJARAN)
   * ----------------------------------------------------------- */
  const predikatData = await db("master_predikat as mp")
    .select(
      "mp.DESKRIPSI_A",
      "mp.DESKRIPSI_B",
      "mp.DESKRIPSI_C",
      "mp.DESKRIPSI_D"
    )
    .where({
      "mp.KODE_MAPEL": KODE_MAPEL,           // ✅ Filter by mapel
      "mp.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID  // ✅ Filter by tahun
    })
    .first();

  if (!predikatData) {
    return null; // Predikat belum di-set untuk mapel ini
  }

  /* -----------------------------------------------------------
   * 3. AMBIL SISWA + NILAI
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
    kkm: kkmData.KKM || 75,
    kompleksitas: kkmData.KOMPLEKSITAS,
    daya_dukung: kkmData.DAYA_DUKUNG,
    intake: kkmData.INTAKE,
    deskripsi_template: {
      A: predikatData.DESKRIPSI_A || "Sangat Baik",
      B: predikatData.DESKRIPSI_B || "Baik",
      C: predikatData.DESKRIPSI_C || "Cukup",
      D: predikatData.DESKRIPSI_D || "Kurang"
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