/**
 * Migration: Create Master Jurusan (dengan id auto dan JURUSAN_ID unik)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('master_jurusan', (table) => {
    // ID auto increment (primary key internal)
    table.increments('id').primary();

    // Kode jurusan manual & unik (untuk relasi)
    table.string('JURUSAN_ID', 5).notNullable().unique();

    // Data jurusan
    table.string('NAMA_JURUSAN', 100).notNullable();
    table.text('DESKRIPSI').nullable();

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
  return knex.schema.dropTableIfExists('master_jurusan');
}
