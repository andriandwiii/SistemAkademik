/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.table("absensi_siswa", (table) => {
    // Tambahkan kolom yang kurang sesuai query error Anda
    table.string("KODE_PELANGGARAN", 20).nullable()
      .references("KODE_PELANGGARAN").inTable("master_pelanggaran")
      .onDelete("SET NULL").onUpdate("CASCADE");
      
    table.timestamp("TGL_VERIFIKASI_BK").nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table("absensi_siswa", (table) => {
    table.dropColumn("KODE_PELANGGARAN");
    table.dropColumn("TGL_VERIFIKASI_BK");
  });
}