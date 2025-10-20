/**
 * Migration: Create Master Gedung (dengan id auto dan GEDUNG_ID unik)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('master_gedung', (table) => {
    // ID auto increment (primary key)
    table.increments('id').primary();

    // GEDUNG_ID manual dan unik (untuk relasi)
    table.string('GEDUNG_ID', 6).notNullable().unique();

    // Data gedung
    table.string('NAMA_GEDUNG', 100).notNullable();
    table.string('LOKASI', 255).nullable();

    // Timestamp
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('master_gedung');
}
