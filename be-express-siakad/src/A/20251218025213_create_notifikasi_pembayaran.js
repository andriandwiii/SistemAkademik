/**
 * Migration: Notifikasi & Reminder Pembayaran
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("notifikasi_pembayaran", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("NOTIFIKASI_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NIS", 10).notNullable();
    table.string("NO_TELP_ORTU", 15).notNullable();
    table
      .enum("JENIS", [
        "TAGIHAN_BARU",
        "REMINDER",
        "TEGURAN",
        "KONFIRMASI_BAYAR",
      ])
      .notNullable();
    table.text("PESAN").notNullable();
    table.enum("STATUS", ["PENDING", "TERKIRIM", "GAGAL"]).defaultTo("PENDING");
    table.timestamp("TGL_KIRIM");
    table.text("RESPONSE");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign Keys
    table
      .foreign("NIS")
      .references("NIS")
      .inTable("master_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("notifikasi_pembayaran");
}