/**
 * Migration: Cicilan
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("cicilan", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("CICILAN_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("TAGIHAN_ID", 20).notNullable();
    table.integer("CICILAN_KE").notNullable();
    table.decimal("NOMINAL", 15, 2).notNullable();
    table.date("TGL_JATUH_TEMPO").notNullable();
    table.enum("STATUS", ["BELUM_BAYAR", "LUNAS"]).defaultTo("BELUM_BAYAR");
    table.date("TGL_BAYAR");
    table.string("PEMBAYARAN_ID", 20);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Foreign Keys
    table
      .foreign("TAGIHAN_ID")
      .references("TAGIHAN_ID")
      .inTable("tagihan_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("PEMBAYARAN_ID")
      .references("PEMBAYARAN_ID")
      .inTable("pembayaran")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("cicilan");
}