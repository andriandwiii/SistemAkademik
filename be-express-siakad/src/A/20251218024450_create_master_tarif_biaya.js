/**
 * Migration: Master Tarif Biaya
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("master_tarif_biaya", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("TARIF_ID", 15).notNullable().unique(); // Unique identifier untuk relasi
    table.string("KOMPONEN_ID", 10).notNullable();
    table.string("KATEGORI_ID", 10).notNullable();
    table.string("TAHUN_AJARAN_ID", 6).notNullable();
    table.string("TINGKATAN_ID", 6);
    table.decimal("NOMINAL", 15, 2).notNullable();
    table.enum("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Foreign Keys
    table
      .foreign("KOMPONEN_ID")
      .references("KOMPONEN_ID")
      .inTable("master_komponen_biaya")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("KATEGORI_ID")
      .references("KATEGORI_ID")
      .inTable("master_kategori_siswa")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("TAHUN_AJARAN_ID")
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("TINGKATAN_ID")
      .references("TINGKATAN_ID")
      .inTable("master_tingkatan")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    // Unique per kombinasi (dengan nama custom yang lebih pendek)
    table.unique(
      ["KOMPONEN_ID", "KATEGORI_ID", "TAHUN_AJARAN_ID", "TINGKATAN_ID"],
      "uq_tarif_biaya_combo" // Custom name yang pendek
    );
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("master_tarif_biaya");
}