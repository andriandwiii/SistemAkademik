/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_tahun_ajaran", (table) => {
    table.increments("ID").primary(); // Primary key auto increment
    table.string("TAHUN_AJARAN_ID", 6).notNullable().unique(); 
    // Contoh: TA2024-2025, TA2025-2026

    table.string("NAMA_TAHUN_AJARAN", 50).notNullable(); 
    // Contoh: Tahun Ajaran 2024/2025

    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Tidak Aktif");
    // Hanya satu tahun ajaran yang aktif biasanya

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_tahun_ajaran");
}
