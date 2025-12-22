/**
 * Migration: Master Komponen Biaya
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("master_komponen_biaya", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("KOMPONEN_ID", 10).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NAMA_KOMPONEN", 100).notNullable();
    table.enum("JENIS_BIAYA", ["RUTIN", "NON_RUTIN"]).notNullable();
    table.text("DESKRIPSI");
    table.boolean("WAJIB").defaultTo(true);
    table.enum("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.integer("URUTAN").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );
  });
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("master_komponen_biaya");
}