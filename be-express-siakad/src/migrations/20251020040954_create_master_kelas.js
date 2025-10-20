/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_kelas", (table) => {
    table.increments("id").primary(); // Primary key auto increment
    table.string("KELAS_ID", 6).notNullable().unique(); // Unique ID kelas

    table
      .string("GEDUNG_ID", 6)
      .notNullable()
      .references("GEDUNG_ID")
      .inTable("master_gedung")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .string("RUANG_ID", 5)
      .notNullable()
      .references("RUANG_ID")
      .inTable("master_ruang")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Status & timestamps
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_kelas");
}
