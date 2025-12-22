/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  return knex.schema.createTable("master_pelanggaran", (table) => {
    table.increments("ID").primary();
    table.string("KODE_PELANGGARAN", 10).unique(); // Contoh: P001, P002
    table.string("NAMA_PELANGGARAN", 100).notNullable(); // Contoh: Membolos, Terlambat
    
    // Kategori untuk menentukan warna Tag di UI nanti
    table.enum("KATEGORI", ["RINGAN", "SEDANG", "BERAT", "SANGAT BERAT"])
      .defaultTo("RINGAN");
      
    table.integer("BOBOT_POIN").defaultTo(0); // Poin yang akan diakumulasi ke siswa
    
    // Pemicu otomatis untuk tombol cetak surat
    table.string("TINDAKAN_DEFAULT", 100).defaultTo("Teguran Lisan"); 
    
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_pelanggaran");
}