/**
 * Migration: Create Master KKM
 * Satu KKM per mata pelajaran per tahun ajaran (unique KODE_MAPEL + TAHUN_AJARAN_ID)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_kkm", (table) => {
    // Primary key internal
    table.increments("ID").primary();

    // Kode KKM yang unik (opsional -> tetap ada kolom ID sebagai PK)
    table.string("KODE_KKM", 20).notNullable().unique();

    // Relasi ke master_mata_pelajaran -> KODE_MAPEL
    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_tahun_ajaran -> TAHUN_AJARAN_ID
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Komponen KKM
    table.integer("KOMPLEKSITAS").notNullable();
    table.integer("DAYA_DUKUNG").notNullable();
    table.integer("INTAKE").notNullable();
    table.decimal("KKM", 5, 2).notNullable();

    table.string("KETERANGAN", 100);
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).notNullable().defaultTo("Aktif");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unique: Satu mapel hanya punya 1 KKM per tahun ajaran
    table.unique(["KODE_MAPEL", "TAHUN_AJARAN_ID"], "uniq_mapel_tahun");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_kkm");
}
