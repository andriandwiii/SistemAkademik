import { db } from "../core/config/knex.js";

const PelanggaranTable = "master_pelanggaran";

// 1. Ambil semua katalog pelanggaran
export const getAllMasterPelanggaran = async () => {
  return db(PelanggaranTable).select("*").orderBy("BOBOT_POIN", "asc");
};

// 2. Ambil berdasarkan ID (untuk validasi atau detail)
export const getMasterPelanggaranById = async (id) => {
  return db(PelanggaranTable).where({ ID: id }).first();
};

// 3. Buat jenis pelanggaran baru
export const createMasterPelanggaran = async (data) => {
  // Logic: Insert data sesuai schema migration kita sebelumnya
  const [id] = await db(PelanggaranTable).insert({
    KODE_PELANGGARAN: data.KODE_PELANGGARAN,
    NAMA_PELANGGARAN: data.NAMA_PELANGGARAN,
    KATEGORI: data.KATEGORI, // RINGAN, SEDANG, BERAT
    BOBOT_POIN: data.BOBOT_POIN,
    TINDAKAN_DEFAULT: data.TINDAKAN_DEFAULT, // e.g., "SURAT PEMANGGILAN"
  });
  
  return db(PelanggaranTable).where({ ID: id }).first();
};

// 4. Update data master (misal mau ubah bobot poin)
export const updateMasterPelanggaran = async (id, data) => {
  const result = await db(PelanggaranTable)
    .where({ ID: id })
    .update({
      NAMA_PELANGGARAN: data.NAMA_PELANGGARAN,
      KATEGORI: data.KATEGORI,
      BOBOT_POIN: data.BOBOT_POIN,
      TINDAKAN_DEFAULT: data.TINDAKAN_DEFAULT,
      updated_at: db.fn.now()
    });

  if (result) {
    return db(PelanggaranTable).where({ ID: id }).first();
  }
  return null;
};

// 5. Hapus jenis pelanggaran
export const deleteMasterPelanggaran = async (id) => {
  const data = await db(PelanggaranTable).where({ ID: id }).first();
  if (!data) return null;

  await db(PelanggaranTable).where({ ID: id }).del();
  return data;
};