/**
 * Migration: Create Transaksi Guru ke Kelas (Guru sebagai Wali Kelas)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_guru_wakel", (table) => {
    // Primary key internal
    table.increments("ID").primary();

    // Unique kode transaksi
    table.string("TRANSAKSI_ID", 10).notNullable().unique();

    // Relasi ke master_guru pakai NIP
    table
      .string("NIP", 20)
      .notNullable()
      .references("NIP")
      .inTable("master_guru")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // 🔹 Foreign key ke master_tingkatan
    table
      .string("TINGKATAN_ID", 6)
      .notNullable()
      .references("TINGKATAN_ID")
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

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unik per guru per kelas (satu guru tidak bisa wali di dua kelas yang sama)
    table.unique(["NIP", "KELAS_ID"], {
      indexName: "uniq_guru_kelas",
    });

    // Index pencarian cepat
    table.index(["NIP", "TINGKATAN_ID", "JURUSAN_ID", "KELAS_ID"]);
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_guru_wakel");
}
