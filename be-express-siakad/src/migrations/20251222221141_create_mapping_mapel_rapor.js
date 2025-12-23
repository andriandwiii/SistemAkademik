/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("mapping_mapel_rapor", (table) => {
    table.bigIncrements("ID").primary();

    // Relasi ke Master Tingkatan (ID: 1, 2, 3)
    table.integer("TINGKATAN_ID_REF").unsigned().notNullable();
    table.foreign("TINGKATAN_ID_REF")
         .references("id")
         .inTable("master_tingkatan")
         .onDelete("CASCADE");

    // Relasi ke Master Mata Pelajaran
    table.bigInteger("MAPEL_ID").unsigned().notNullable();
    table.foreign("MAPEL_ID")
         .references("ID")
         .inTable("master_mata_pelajaran")
         .onDelete("CASCADE");

    // Nama yang akan tampil di cetak rapor
    table.string("NAMA_LOKAL", 255).nullable();

    // Relasi ke Master Kelompok Mapel (ID: 1 s/d 6)
    table.integer("KELOMPOK_ID").unsigned().nullable();
    table.foreign("KELOMPOK_ID")
         .references("ID")
         .inTable("master_kelompok_mapel")
         .onDelete("SET NULL");

    // Nomor urut tampilan di rapor
    table.integer("NO_URUT").nullable().defaultTo(0);

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index untuk mempercepat query pencarian per tingkat
    table.index(["TINGKATAN_ID_REF", "NO_URUT"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("mapping_mapel_rapor");
}