/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("referensi_tanggal_rapor", (table) => {
    table.increments("ID").primary();

    // Data Utama
    table.string("SEMESTER", 50).notNullable().unique(); // Contoh: "2024/2025 Genap"
    table.integer("SEMESTER_KE").notNullable(); // 1 atau 2
    table.string("TEMPAT_CETAK", 100).notNullable(); // Contoh: "Karangasem"
    table.date("TANGGAL_CETAK").notNullable(); // Contoh: 2025-08-04

    // Setting Tampilan Cetak Rapor
    table.string("TULISAN_KS", 100).defaultTo("Kepala Sekolah"); // Misal: Plt. Kepala Sekolah
    table.string("NIP_KEPSEK_LABEL", 10).defaultTo("NIP."); // Pilihan NIP. atau NIY.
    table.string("NIP_WALAS_LABEL", 10).defaultTo("NIP."); // Pilihan NIP. atau NIY.
    table.string("TTD_VALIDASI", 50).defaultTo("Tanpa ttd Validasi");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("referensi_tanggal_rapor");
}