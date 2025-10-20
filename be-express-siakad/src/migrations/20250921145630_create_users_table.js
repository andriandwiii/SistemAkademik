/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password', 255).notNullable();
    table.enu('role', [
      'SUPER_ADMIN',
      'KURIKULUM',
      'KESISWAAN',
      'KEUANGAN',
      'TU_TASM',
      'BP_BKM',
      'ADMIN_WEB',
      'GURU',
      'SISWA'
    ]).notNullable().defaultTo('SISWA');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
