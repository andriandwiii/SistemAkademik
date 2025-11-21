/**
 * Migration: Create Transaksi KKM (Fixed KODE_KKM)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_kkm", (table) => {
    table.increments("ID").primary();

    // ID transaksi
    table.string("TRANSAKSI_ID", 12).notNullable().unique();

    // Foreign keys master (with short index names)
    table
      .string("TINGKATAN_ID", 6)
      .notNullable()
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE")
      .index("idx_tingkat");

    table
      .string("JURUSAN_ID", 5)
      .notNullable()
      .references("JURUSAN_ID")
      .inTable("master_jurusan")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE")
      .index("idx_jurusan");

    table
      .string("KELAS_ID", 6)
      .notNullable()
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
      .index("idx_kelas");

    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
      .index("idx_mapel");

    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE")
      .index("idx_tahun");

    // --- PERUBAHAN DI SINI: MENGGUNAKAN KODE_KKM ---
    table
      .string("KODE_KKM", 8) // Sesuaikan panjang string dengan di master_kkm
      .notNullable()
      .references("KODE_KKM") // Referensi ke kolom KODE_KKM di master
      .inTable("master_kkm")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE")
      .index("idx_kode_kkm");

    // Timestamp
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Unique kombinasi
    table.unique(["KELAS_ID", "KODE_MAPEL", "TAHUN_AJARAN_ID"], {
      indexName: "uniq_kelas_mapel_tahun",
    });
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_kkm");
}