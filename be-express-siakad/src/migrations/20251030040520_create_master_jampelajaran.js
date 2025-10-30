/**
 * Migration: Create Master Jam Pelajaran
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_jam_pelajaran", (table) => {
    // ID auto increment (primary key)
    table.increments("ID").primary();

    // Kode jam pelajaran unik (JP01, JP02, dst)
    table.string("KODE_JP", 10).notNullable().unique();

    // Nomor urutan jam pelajaran
    table.integer("JP_KE").nullable();

    // Waktu mulai & selesai
    table.time("WAKTU_MULAI").notNullable();
    table.time("WAKTU_SELESAI").notNullable();

    // Durasi (menit)
    table.integer("DURASI").notNullable().defaultTo(45);

    // Deskripsi (misal: Pelajaran, Istirahat, Upacara)
    table.string("DESKRIPSI", 100).defaultTo("Pelajaran");

    // Timestamp otomatis
    table
      .timestamp("created_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_jam_pelajaran");
}
