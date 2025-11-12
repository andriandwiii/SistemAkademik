import { db } from "../core/config/knex.js";

/** 🔹 Ambil semua data KKM (JOIN ke tabel master_mata_pelajaran) */
export const getAllKKM = async () => {
  return db("master_kkm as kkm")
    .leftJoin("master_mata_pelajaran as mp", "kkm.KODE_MAPEL", "mp.KODE_MAPEL")
    .select(
      "kkm.ID",
      "kkm.KODE_KKM",
      "kkm.KODE_MAPEL",
      "mp.NAMA_MAPEL",
      "kkm.KOMPLEKSITAS",
      "kkm.DAYA_DUKUNG",
      "kkm.INTAKE",
      "kkm.KKM",
      "kkm.KETERANGAN",
      "kkm.STATUS",
      "kkm.CREATED_AT",
      "kkm.UPDATED_AT"
    )
    .orderBy("kkm.ID", "asc");
};

/** 🔹 Ambil satu data KKM berdasarkan ID */
export const getKKMById = async (id) => {
  return db("master_kkm as kkm")
    .leftJoin("master_mata_pelajaran as mp", "kkm.KODE_MAPEL", "mp.KODE_MAPEL")
    .select(
      "kkm.ID",
      "kkm.KODE_KKM",
      "kkm.KODE_MAPEL",
      "mp.NAMA_MAPEL",
      "kkm.KOMPLEKSITAS",
      "kkm.DAYA_DUKUNG",
      "kkm.INTAKE",
      "kkm.KKM",
      "kkm.KETERANGAN",
      "kkm.STATUS",
      "kkm.CREATED_AT",
      "kkm.UPDATED_AT"
    )
    .where("kkm.ID", id)
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

/** 🔹 Tambah data KKM baru (otomatis generate kode & hitung KKM) */
export const createKKM = async (data) => {
  const kodeBaru = await generateKodeKKM();
  const nilaiKKM = hitungKKM(data.KOMPLEKSITAS, data.DAYA_DUKUNG, data.INTAKE);

  const [insertedId] = await db("master_kkm").insert({
    KODE_KKM: kodeBaru,
    KODE_MAPEL: data.KODE_MAPEL,
    KOMPLEKSITAS: data.KOMPLEKSITAS,
    DAYA_DUKUNG: data.DAYA_DUKUNG,
    INTAKE: data.INTAKE,
    KKM: nilaiKKM,
    KETERANGAN: data.KETERANGAN || "-",
    STATUS: data.STATUS || "Aktif",
    CREATED_AT: db.fn.now(),
    UPDATED_AT: db.fn.now(),
  });

  return getKKMById(insertedId);
};

/** 🔹 Update data KKM (otomatis hitung ulang KKM) */
export const updateKKM = async (id, data) => {
  const nilaiKKM = hitungKKM(data.KOMPLEKSITAS, data.DAYA_DUKUNG, data.INTAKE);

  await db("master_kkm")
    .where("ID", id)
    .update({
      KODE_KKM: data.KODE_KKM,
      KODE_MAPEL: data.KODE_MAPEL,
      KOMPLEKSITAS: data.KOMPLEKSITAS,
      DAYA_DUKUNG: data.DAYA_DUKUNG,
      INTAKE: data.INTAKE,
      KKM: nilaiKKM,
      KETERANGAN: data.KETERANGAN,
      STATUS: data.STATUS,
      UPDATED_AT: db.fn.now(),
    });

  return getKKMById(id);
};

/** 🔹 Hapus data KKM */
export const deleteKKM = async (id) => {
  return db("master_kkm").where("ID", id).del();
};
