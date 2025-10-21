/**
 * Migration: Create Master Tingkatan (dengan id auto dan TINGKATAN_ID unik)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('master_tingkatan', (table) => {
    // ID auto increment (primary key)
    table.increments('id').primary();

    // TINGKATAN_ID manual dan unik (untuk relasi)
    table.string('TINGKATAN_ID', 6).notNullable().unique();

    // Data tingkatan
    table.enu('TINGKATAN', ['X', 'XI', 'XII']).notNullable().unique();
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
  return knex.schema.dropTableIfExists('master_tingkatan');
}
