/**
 * Migration: Tambah Tahun Ajaran & Semester ke Master Jadwal
 * Mengacu ke master_tahun_ajaran -> TAHUN_AJARAN_ID
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("master_jadwal", (table) => {
    // Tambah kolom Tahun Ajaran
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .defaultTo("TA2025") // default ke tahun aktif saat ini
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Tambah kolom Semester
    table.enu("SEMESTER", ["GANJIL", "GENAP"]).notNullable().defaultTo("GANJIL");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("master_jadwal", (table) => {
    table.dropColumn("TAHUN_AJARAN_ID");
    table.dropColumn("SEMESTER");
  });
}
