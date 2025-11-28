import { db } from "../core/config/knex.js";

/** 🔹 Ambil semua data KKM (JOIN ke mapel + tahun ajaran) */
export const getAllKKM = async () => {
  return db("master_kkm as kkm")
    .leftJoin("master_mata_pelajaran as mp", "kkm.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_tahun_ajaran as ta", "kkm.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .select(
      "kkm.ID",
      "kkm.KODE_KKM",
      "kkm.KODE_MAPEL",
      "mp.NAMA_MAPEL",
      "kkm.TAHUN_AJARAN_ID",
      "ta.NAMA_TAHUN_AJARAN",
      "kkm.KOMPLEKSITAS",
      "kkm.DAYA_DUKUNG",
      "kkm.INTAKE",
      "kkm.KKM",
      "kkm.KETERANGAN",
      "kkm.STATUS",
      "kkm.created_at",
      "kkm.updated_at"
    )
    .orderBy("kkm.ID", "desc");
};

/** 🔹 Ambil satu data KKM berdasarkan ID */
export const getKKMById = async (id) => {
  return db("master_kkm as kkm")
    .leftJoin("master_mata_pelajaran as mp", "kkm.KODE_MAPEL", "mp.KODE_MAPEL")
    .leftJoin("master_tahun_ajaran as ta", "kkm.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .select(
      "kkm.ID",
      "kkm.KODE_KKM",
      "kkm.KODE_MAPEL",
      "mp.NAMA_MAPEL",
      "kkm.TAHUN_AJARAN_ID",
      "ta.NAMA_TAHUN_AJARAN",
      "kkm.KOMPLEKSITAS",
      "kkm.DAYA_DUKUNG",
      "kkm.INTAKE",
      "kkm.KKM",
      "kkm.KETERANGAN",
      "kkm.STATUS",
      "kkm.created_at",
      "kkm.updated_at"
    )
    .where("kkm.ID", id)
    .first();
};

/** 🔹 Cek duplikat KKM (mapel + tahun ajaran) */
export const checkDuplicate = async (KODE_MAPEL, TAHUN_AJARAN_ID) => {
  return db("master_kkm")
    .where({ KODE_MAPEL, TAHUN_AJARAN_ID })
    .first();
};

/** 🔹 Cek duplikat KKM kecuali ID tertentu (untuk update) */
export const checkDuplicateExcept = async (KODE_MAPEL, TAHUN_AJARAN_ID, excludeId) => {
  return db("master_kkm")
    .where({ KODE_MAPEL, TAHUN_AJARAN_ID })
    .whereNot("ID", excludeId)
    .first();
};

/** 🔹 Ambil data terakhir (untuk auto generate KODE_KKM) */
export const getLastKKM = async () => {
  return db("master_kkm").orderBy("KODE_KKM", "desc").first();
};

/** 🔹 Generate kode KKM otomatis */
export const generateKodeKKM = async () => {
  const last = await getLastKKM();
  if (!last || !last.KODE_KKM) {
    return "KKM001";
  }

  const lastNumber = parseInt(last.KODE_KKM.replace("KKM", "")) || 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `KKM${newNumber}`;
};

/** 🔹 Hitung otomatis nilai KKM dari 3 komponen */
const hitungKKM = (KOMPLEKSITAS, DAYA_DUKUNG, INTAKE) => {
  return Math.round(
    (Number(KOMPLEKSITAS) + Number(DAYA_DUKUNG) + Number(INTAKE)) / 3
  );
};

/** 🔹 Tambah data KKM baru */
export const createKKM = async (data) => {
  const kodeBaru = await generateKodeKKM();
  const nilaiKKM = hitungKKM(data.KOMPLEKSITAS, data.DAYA_DUKUNG, data.INTAKE);

  const [insertedId] = await db("master_kkm").insert({
    KODE_KKM: kodeBaru,
    KODE_MAPEL: data.KODE_MAPEL,
    TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID, // ✅ TAMBAHKAN
    KOMPLEKSITAS: data.KOMPLEKSITAS,
    DAYA_DUKUNG: data.DAYA_DUKUNG,
    INTAKE: data.INTAKE,
    KKM: nilaiKKM,
    KETERANGAN: data.KETERANGAN || "-",
    STATUS: data.STATUS || "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return getKKMById(insertedId);
};

/** 🔹 Update data KKM */
export const updateKKM = async (id, data) => {
  const nilaiKKM = hitungKKM(data.KOMPLEKSITAS, data.DAYA_DUKUNG, data.INTAKE);

  await db("master_kkm")
    .where("ID", id)
    .update({
      KODE_KKM: data.KODE_KKM,
      KODE_MAPEL: data.KODE_MAPEL,
      TAHUN_AJARAN_ID: data.TAHUN_AJARAN_ID, // ✅ TAMBAHKAN
      KOMPLEKSITAS: data.KOMPLEKSITAS,
      DAYA_DUKUNG: data.DAYA_DUKUNG,
      INTAKE: data.INTAKE,
      KKM: nilaiKKM,
      KETERANGAN: data.KETERANGAN,
      STATUS: data.STATUS,
      updated_at: db.fn.now(),
    });

  return getKKMById(id);
};

/** 🔹 Hapus data KKM */
export const deleteKKM = async (id) => {
  return db("master_kkm").where("ID", id).del();
};