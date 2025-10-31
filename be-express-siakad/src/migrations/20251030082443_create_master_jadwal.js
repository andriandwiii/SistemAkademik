/**
 * Migration: Create Master Jadwal
 * Semua FK mengacu ke kolom unik, bukan ID
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_jadwal", (table) => {
    // Primary Key internal
    table.bigIncrements("ID").primary();

    // Kode jadwal unik
    table.string("KODE_JADWAL", 6).notNullable().unique();

    // Relasi ke master_hari -> NAMA_HARI
    table
      .string("HARI", 20)
      .notNullable()
      .references("NAMA_HARI")
      .inTable("master_hari")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_tingkatan -> TINGKATAN_ID
    table
      .string("TINGKATAN_ID", 6)
      .notNullable()
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_jurusan -> JURUSAN_ID
    table
      .string("JURUSAN_ID", 5)
      .notNullable()
      .references("JURUSAN_ID")
      .inTable("master_jurusan")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_kelas -> KELAS_ID
    table
      .string("KELAS_ID", 6)
      .notNullable()
      .references("KELAS_ID")
      .inTable("master_kelas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_guru -> NIP
    table
      .string("NIP", 20)
      .notNullable()
      .references("NIP")
      .inTable("master_guru")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_mata_pelajaran -> MAPEL_ID
    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Relasi ke master_jam_pelajaran -> KODE_JP
    table
      .string("KODE_JP", 10)
      .notNullable()
      .references("KODE_JP")
      .inTable("master_jam_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_jadwal");
}
