import { db } from "../core/config/knex.js";

const JurusanTable = "master_jurusan";

// Ambil semua jurusan
export const getAllJurusan = async () => {
  return db(JurusanTable).select("*").orderBy("JURUSAN_ID", "asc");
};

// Ambil jurusan berdasarkan ID
export const getJurusanById = async (id) => {
  return db(JurusanTable).where({ JURUSAN_ID: id }).first();
};

// Buat jurusan baru
export const createJurusan = async (data) => {
  const [id] = await db(JurusanTable).insert({
    NAMA_JURUSAN: data.NAMA_JURUSAN,
    DESKRIPSI: data.DESKRIPSI,
  });
  return db(JurusanTable).where({ JURUSAN_ID: id }).first();
};

// Update jurusan
export const updateJurusan = async (id, data) => {
  const result = await db(JurusanTable)
    .where({ JURUSAN_ID: id })
    .update({ NAMA_JURUSAN: data.NAMA_JURUSAN, DESKRIPSI: data.DESKRIPSI, updated_at: db.fn.now() });

  if (result) {
    return db(JurusanTable).where({ JURUSAN_ID: id }).first();
  }
  return null;
};

// Hapus jurusan
export const deleteJurusan = async (id) => {
  const jurusan = await db(JurusanTable).where({ JURUSAN_ID: id }).first();
  if (!jurusan) return null;

  await db(JurusanTable).where({ JURUSAN_ID: id }).del();
  return jurusan;
};
