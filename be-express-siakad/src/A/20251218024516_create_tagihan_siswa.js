/**
 * Migration: Tagihan Siswa
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("tagihan_siswa", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("TAGIHAN_ID", 20).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NOMOR_TAGIHAN", 20).notNullable().unique();
    table.string("NIS", 10).notNullable();
    table.string("KOMPONEN_ID", 10).notNullable();
    table.string("TAHUN_AJARAN_ID", 6).notNullable();
    table.integer("BULAN"); // 1-12 untuk SPP, NULL untuk biaya lain
    table.integer("TAHUN"); // Tahun
    table.decimal("NOMINAL", 15, 2).notNullable();
    table.decimal("POTONGAN", 15, 2).defaultTo(0);
    table.decimal("TOTAL", 15, 2).notNullable();
    table
      .enum("STATUS", ["BELUM_BAYAR", "SEBAGIAN", "LUNAS", "DISPENSASI"])
      .defaultTo("BELUM_BAYAR");
    table.date("TGL_JATUH_TEMPO");
    table.date("TGL_LUNAS");
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

    table
      .foreign("KOMPONEN_ID")
      .references("KOMPONEN_ID")
      .inTable("master_komponen_biaya")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("TAHUN_AJARAN_ID")
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Indexes
    table.index(["NIS", "STATUS"]);
    table.index(["TAHUN_AJARAN_ID", "BULAN"]);
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("tagihan_siswa");
}