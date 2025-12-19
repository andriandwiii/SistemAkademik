/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_jenis_ujian", (table) => {
    table.increments("ID").primary();

    table.string("KODE_UJIAN", 10).notNullable().unique();
    table.string("NAMA_UJIAN", 50).notNullable();

    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    // timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // unik kombinasi
    table.unique(["KODE_UJIAN", "NAMA_UJIAN"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_jenis_ujian");
}
