/**
 * Migration: Create Transaksi Siswa ke Kelas
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_siswa_kelas", (table) => {
    // Primary key internal
    table.increments("ID").primary();

    // Unique kode transaksi (opsional)
    table.string("TRANSAKSI_ID", 10).notNullable().unique();

    // Relasi ke master_siswa pakai NIS
    table
      .string("NIS", 10)
      .notNullable()
      .references("NIS")
      .inTable("master_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Langsung gunakan nilai enum TINGKATAN
    table
      .enu("TINGKATAN", ["X", "XI", "XII"])
      .notNullable()
      .references("TINGKATAN")
      .inTable("master_tingkatan")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    // Relasi ke master_jurusan pakai kode jurusan unik
    table
      .string("JURUSAN_ID", 5)
      .notNullable()
      .references("JURUSAN_ID")
      .inTable("master_jurusan")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Relasi ke master_kelas pakai KELAS_ID
    table
      .string("KELAS_ID", 6)
      .notNullable()
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Relasi ke master_tahun_ajaran pakai TAHUN_AJARAN_ID
    table
      .string("TAHUN_AJARAN_ID", 6)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unik per siswa per tahun ajaran
    table.unique(["NIS", "TAHUN_AJARAN_ID"], {
      indexName: "uniq_siswa_tahun",
    });

    // Index pencarian cepat
    table.index(["NIS", "TINGKATAN", "JURUSAN_ID", "KELAS_ID"]);
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_siswa_kelas");
}
