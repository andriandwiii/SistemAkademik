/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_informasi", (table) => {
    table.increments("ID").primary(); // Primary Key

    table.string("JUDUL", 255).notNullable(); 
    // Contoh: "Juara 1 Lomba Matematika Nasional"

    table.text("DESKRIPSI").notNullable(); 
    // Detail pengumuman atau rincian prestasi

    table.enu("KATEGORI", ["Akademik", "Ekstrakurikuler", "Umum", "Prestasi"])
         .defaultTo("Umum")
         .notNullable();
    /** * Tambahan kategori "Prestasi" untuk menampung data pencapaian siswa/sekolah
     */

    table.date("TANGGAL").notNullable(); 
    // Tanggal publikasi atau tanggal perolehan prestasi

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_informasi");
}