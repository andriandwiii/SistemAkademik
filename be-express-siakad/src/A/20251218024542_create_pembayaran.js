/**
 * Migration: Pembayaran
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("pembayaran", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("PEMBAYARAN_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NOMOR_PEMBAYARAN", 20).notNullable().unique();
    table.string("NIS", 10).notNullable();
    table.decimal("TOTAL_BAYAR", 15, 2).notNullable();
    table
      .enum("METODE_BAYAR", [
        "TUNAI",
        "TRANSFER_BANK",
        "VA_BCA",
        "VA_BNI",
        "VA_BRI",
        "VA_MANDIRI",
        "GOPAY",
        "OVO",
        "SHOPEEPAY",
        "QRIS",
        "ALFAMART",
        "INDOMARET",
      ])
      .notNullable();
    table
      .enum("STATUS", ["PENDING", "SUKSES", "GAGAL", "EXPIRED"])
      .defaultTo("PENDING");
    table.string("MIDTRANS_ORDER_ID", 100).unique();
    table.string("MIDTRANS_TRANSACTION_ID", 100);
    table.text("MIDTRANS_RESPONSE");
    table.string("KUITANSI_URL", 255);
    table.date("TGL_BAYAR");
    table.string("PETUGAS_ID", 10); // User yang input (jika tunai)
    table.text("KETERANGAN");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Foreign Keys
    table
      .foreign("NIS")
      .references("NIS")
      .inTable("master_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Indexes
    table.index(["NIS", "STATUS"]);
    table.index(["MIDTRANS_ORDER_ID"]);
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("pembayaran");
}