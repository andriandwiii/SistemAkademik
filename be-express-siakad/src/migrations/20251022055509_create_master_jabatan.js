/**
 * Migration: Create Master Jabatan
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('master_jabatan', (table) => {
    // ID auto increment (primary key)
    table.increments('id').primary();

    // KODE_JABATAN manual dan unik (untuk relasi)
    table.string('KODE_JABATAN', 5).notNullable().unique();

    // Nama jabatan
    table.string('NAMA_JABATAN', 100).notNullable();

    // Status jabatan (Aktif / Tidak Aktif)
    table.enu('STATUS', ['Aktif', 'Tidak Aktif']).defaultTo('Aktif');

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
  return knex.schema.dropTableIfExists('master_jabatan');
}
