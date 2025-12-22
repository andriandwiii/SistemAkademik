/**
 * Migration: Detail Pembayaran (Relasi N-N antara Pembayaran dan Tagihan)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("detail_pembayaran", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("DETAIL_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("PEMBAYARAN_ID", 20).notNullable();
    table.string("TAGIHAN_ID", 20).notNullable();
    table.decimal("JUMLAH_BAYAR", 15, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign Keys
    table
      .foreign("PEMBAYARAN_ID")
      .references("PEMBAYARAN_ID")
      .inTable("pembayaran")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("TAGIHAN_ID")
      .references("TAGIHAN_ID")
      .inTable("tagihan_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Unique per kombinasi (dengan nama custom yang lebih pendek)
    table.unique(["PEMBAYARAN_ID", "TAGIHAN_ID"], "uq_detail_pembayaran_combo");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("detail_pembayaran");
}