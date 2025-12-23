/**
 * Migration: Create Master Kelompok Mata Pelajaran
 * Menyimpan referensi kelompok mata pelajaran (A, B, C, dst) 
 * yang akan tampil di e-Rapor.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_kelompok_mapel", (table) => {
    // Primary Key internal
    table.increments("ID").primary();

    // Kolom 'Kelompok' (A, B, C, dst) - biasanya unik per kurikulum
    table.string("KELOMPOK", 5).notNullable();

    // Kolom 'Nama Kelompok' (Kelompok Umum, Peminatan, dll)
    table.string("NAMA_KELOMPOK", 100).notNullable();

    // Status Aktif/Tidak Aktif sesuai gambar
    table
      .enu("STATUS", ["Aktif", "Tidak Aktif"])
      .notNullable()
      .defaultTo("Aktif");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Indexing untuk pencarian cepat
    table.index(["KELOMPOK", "STATUS"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_kelompok_mapel");
}