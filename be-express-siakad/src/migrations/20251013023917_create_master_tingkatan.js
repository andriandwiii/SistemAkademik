/**
 * Migration: Create Master Tingkatan 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_tingkatan", (table) => {
    table.increments("id").primary(); // Kolom id utama (auto increment)
    table.increments("TINGKATAN_ID"); // Masih tetap ada jika kamu butuh ID tambahan

    table
      .enu("TINGKATAN", ["X", "XI", "XII"])
      .notNullable()
      .unique();

    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_tingkatan");
}
