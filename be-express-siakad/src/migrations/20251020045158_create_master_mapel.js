/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_mata_pelajaran", (table) => {
    table.bigIncrements("ID").primary();
    table.string("MAPEL_ID", 8).unique().notNullable(); // diganti dari KODE_MAPEL
    table.string("NAMA_MAPEL", 120).notNullable();
    table.string("KATEGORI", 50).notNullable(); // contoh: Wajib, Peminatan, Muatan Lokal
    table.text("DESKRIPSI").nullable();
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    // timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // index
    table.index(["MAPEL_ID", "NAMA_MAPEL"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_mata_pelajaran");
}
