/**
 * Predikat per mata pelajaran per tahun ajaran
 * Setiap mapel punya template deskripsi berbeda
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_predikat", (table) => {
    // Primary key
    table.increments("ID").primary();

    // Kode predikat
    table.string("KODE_PREDIKAT", 50).notNullable().unique();

    // ✅ Relasi ke mata pelajaran (WAJIB)
    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT")
      .comment("Predikat terikat ke mapel");

    // Relasi ke tahun ajaran
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // ❌ HAPUS TINGKATAN_ID (tidak diperlukan lagi)
    // Predikat sudah spesifik per mapel, tidak perlu per tingkatan

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

    // ✅ Unique constraint: 1 predikat per mapel per tahun ajaran
    table.unique(["KODE_MAPEL", "TAHUN_AJARAN_ID"], "uniq_mapel_tahun");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_predikat");
}