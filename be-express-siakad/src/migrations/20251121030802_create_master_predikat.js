/**
 * Migration: Create Master Predikat
 * Predikat dapat berlaku per tahun ajaran, atau per tahun + tingkatan
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_predikat", (table) => {
    // Primary key
    table.increments("ID").primary();

    // Kode predikat
    table.string("KODE_PREDIKAT", 50).notNullable().unique();

    // Relasi ke tahun ajaran
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Predikat opsional per tingkatan
    table
      .string("TINGKATAN_ID", 6)
      .nullable()
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT")
      .comment("Kosongkan jika berlaku untuk semua tingkat");

    // Template deskripsi A–D
    table
      .text("DESKRIPSI_A")
      .nullable()
      .comment("Template: {nama} menguasai {materi} dengan sangat baik");

    table
      .text("DESKRIPSI_B")
      .nullable()
      .comment("Template: {nama} menguasai {materi} dengan baik");

    table
      .text("DESKRIPSI_C")
      .nullable()
      .comment("Template: {nama} cukup menguasai {materi}");

    table
      .text("DESKRIPSI_D")
      .nullable()
      .comment("Template: {nama} perlu bimbingan dalam {materi}");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unique constraint: 1 predikat per tahun / (tahun + tingkatan)
    table.unique(["TAHUN_AJARAN_ID", "TINGKATAN_ID"], "uniq_tahun_tingkat");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_predikat");
}
