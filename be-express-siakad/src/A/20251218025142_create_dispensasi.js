/**
 * Migration: Dispensasi/Keringanan
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("dispensasi", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("DISPENSASI_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NOMOR_DISPENSASI", 20).notNullable().unique();
    table.string("NIS", 10).notNullable();
    table.string("TAGIHAN_ID", 20);
    table
      .enum("JENIS", [
        "POTONGAN_TETAP",
        "POTONGAN_PERSEN",
        "CICILAN",
        "PEMBEBASAN",
      ])
      .notNullable();
    table.decimal("NILAI_POTONGAN", 15, 2).defaultTo(0);
    table.integer("PERSEN_POTONGAN").defaultTo(0);
    table.integer("JUMLAH_CICILAN").defaultTo(0);
    table.text("ALASAN").notNullable();
    table.string("DOKUMEN_PENDUKUNG", 255);
    table
      .enum("STATUS", ["DIAJUKAN", "DISETUJUI", "DITOLAK"])
      .defaultTo("DIAJUKAN");
    table.string("DISETUJUI_OLEH", 10);
    table.date("TGL_DISETUJUI");
    table.text("CATATAN_APPROVAL");
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

    table
      .foreign("TAGIHAN_ID")
      .references("TAGIHAN_ID")
      .inTable("tagihan_siswa")
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
  await knex.schema.dropTableIfExists("dispensasi");
}