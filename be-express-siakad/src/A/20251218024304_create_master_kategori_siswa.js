/**
 * Migration: Master Kategori Siswa (Jalur Masuk)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("master_kategori_siswa", (table) => {
    table.increments("id").primary(); // Auto increment ID
    table.string("KATEGORI_ID", 10).notNullable().unique(); // Unique identifier untuk relasi
    table.string("NAMA_KATEGORI", 100).notNullable();
    table.text("DESKRIPSI");
    table.integer("PRIORITAS").defaultTo(0); // Urutan tampilan
    table.enum("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
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
  await knex.schema.dropTableIfExists("master_kategori_siswa");
}