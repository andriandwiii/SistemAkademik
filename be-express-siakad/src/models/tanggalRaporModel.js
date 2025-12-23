import { db } from "../core/config/knex.js";

const table = "referensi_tanggal_rapor";

export const getAll = async () => {
  return db(table).orderBy("TANGGAL_CETAK", "desc");
};

export const getBySemester = async (semester) => {
  return db(table).where("SEMESTER", semester).first();
};

export const getPreviewConfig = async (semester, kelasId) => {
  const config = await db(table).where("SEMESTER", semester).first();
  if (!config) return null;

  const walas = await db("transaksi_guru_wakel as tw")
    .join("master_guru as mg", "tw.NIP", "mg.NIP")
    .where("tw.KELAS_ID", kelasId)
    .select("mg.NAMA", "mg.NIP")
    .first();

  const kepsek = await db("master_guru")
    .where("PANGKAT", "Kepala Sekolah")
    .select("NAMA", "NIP")
    .first();

  return { config, walas, kepsek };
};

export const create = async (data) => {
  // Buang ID jika ada dari frontend agar tidak konflik dengan auto-increment
  const { ID, ...payload } = data;
  return db(table).insert({
    ...payload,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
};

export const update = async (id, data) => {
  // 🔹 PENTING: Pisahkan field yang tidak boleh diupdate
  const { ID, created_at, updated_at, ...payload } = data;

  return db(table).where("ID", id).update({
    ...payload,
    updated_at: db.fn.now()
  });
};

export const remove = async (id) => {
  return db(table).where("ID", id).del();
};