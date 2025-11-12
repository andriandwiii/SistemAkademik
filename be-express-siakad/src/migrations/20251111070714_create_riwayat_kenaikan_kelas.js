/**
 * Migration: Create Riwayat Kenaikan Kelas
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("riwayat_kenaikan_kelas", (table) => {
    // Primary key internal
    table.increments("ID").primary();

    // Unique kode riwayat
    table.string("RIWAYAT_ID", 20).notNullable().unique();

    // Relasi ke master_siswa (pakai NIS)
    table
      .string("NIS", 20)
      .notNullable()
      .references("NIS")
      .inTable("master_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Status kenaikan
    table
      .enum("STATUS", ["NAIK", "TINGGAL", "LULUS"])
      .notNullable();

    // ----- Data Asal -----
    table
      .string("TRANSAKSI_LAMA_ID", 20)
      .references("TRANSAKSI_ID")
      .inTable("transaksi_siswa_kelas")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("TAHUN_AJARAN_LAMA_ID", 20)
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("KELAS_LAMA_ID", 20)
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("TINGKATAN_LAMA_ID", 20)
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("JURUSAN_LAMA_ID", 20)
      .references("JURUSAN_ID")
      .inTable("master_jurusan")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    // ----- Data Tujuan -----
    table
      .string("TRANSAKSI_BARU_ID", 20)
      .references("TRANSAKSI_ID")
      .inTable("transaksi_siswa_kelas")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("TAHUN_AJARAN_BARU_ID", 20)
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("KELAS_BARU_ID", 20)
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("TINGKATAN_BARU_ID", 20)
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .string("JURUSAN_BARU_ID", 20)
      .references("JURUSAN_ID")
      .inTable("master_jurusan")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    // Metadata
    table.string("PROSES_OLEH", 50);
    table.text("KETERANGAN");

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Index tambahan
    table.index(["NIS"], "idx_nis");
    table.index(["STATUS"], "idx_status");
    table.index(["TAHUN_AJARAN_BARU_ID"], "idx_tahun_baru");
    table.index(["created_at"], "idx_created");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("riwayat_kenaikan_kelas");
}
