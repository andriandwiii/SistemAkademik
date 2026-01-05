/**
 * Migration: Create Transaksi Nilai
 * Setiap siswa hanya punya 1 nilai per mapel per semester & tahun ajaran
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_nilai", (table) => {
    table.increments("ID").primary();

    // Relasi siswa
    table
      .string("NIS", 20)
      .notNullable()
      .references("NIS")
      .inTable("master_siswa")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    // Relasi kelas
    table
      .string("KELAS_ID", 20)
      .notNullable()
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    // Relasi mapel
    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    // Relasi tahun ajaran
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Semester
    table.enu("SEMESTER", ["1", "2"]).notNullable().defaultTo("1");

    // Nilai
    table.decimal("NILAI_P", 5, 2).nullable().comment("Nilai Pengetahuan");
    table.decimal("NILAI_K", 5, 2).nullable().comment("Nilai Keterampilan");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unique constraint (1 siswa hanya 1 nilai/mapel/semester)
    table.unique(
      ["NIS", "KODE_MAPEL", "KELAS_ID", "TAHUN_AJARAN_ID", "SEMESTER"],
      "uniq_nilai_siswa"
    );

    // Index untuk query cepat
    table.index(
      ["KELAS_ID", "KODE_MAPEL", "TAHUN_AJARAN_ID"],
      "idx_query_nilai"
    );
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_nilai");
}
