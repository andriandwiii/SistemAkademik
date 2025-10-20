/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_hari", (table) => {
    table.increments("HARI_ID").primary();

    table.string("NAMA_HARI", 20).notNullable().unique(); 
    table.integer("URUTAN").notNullable();
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Kombinasi unik antara nama dan urutan hari
    table.unique(["NAMA_HARI", "URUTAN"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_hari");
}
