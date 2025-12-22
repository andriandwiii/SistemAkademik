import { db } from "../core/config/knex.js";

const table = "riwayat_perubahan_absensi";

/**
 * Menyimpan log perubahan status absensi
 * @param {Object} data - Objek berisi absensiId, statusLama, statusBaru, alasan, userId (NIP)
 * @param {Object} trx - Knex Transaction instance (optional)
 */
export const simpanLogPerubahan = async (data, trx) => {
  const dbInstance = trx || db;
  
  return await dbInstance(table).insert({
    ABSENSI_ID: data.absensiId,
    STATUS_LAMA: data.statusLama,
    STATUS_BARU: data.statusBaru,
    ALASAN: data.alasan,
    // Diisi dengan NIP (String) sesuai migration terbaru
    DIUBAH_OLEH_ID: data.userId, 
    created_at: new Date()
  });
};

/**
 * Mengambil riwayat perubahan untuk satu data absen tertentu
 * Join langsung ke master_guru menggunakan NIP
 */
export const getLogByAbsensiId = async (absensiId) => {
  return await db(`${table} as r`)
    .select(
      "r.ID",
      "r.ABSENSI_ID",
      "r.STATUS_LAMA",
      "r.STATUS_BARU",
      "r.ALASAN",
      "r.created_at",
      "r.DIUBAH_OLEH_ID as NIP_PENGUBAH",
      "g.NAMA as NAMA_PENGUBAH"
    )
    // Join langsung via NIP karena DIUBAH_OLEH_ID menyimpan NIP
    .leftJoin("master_guru as g", "r.DIUBAH_OLEH_ID", "g.NIP")
    .where("r.ABSENSI_ID", absensiId)
    .orderBy("r.created_at", "desc");
};