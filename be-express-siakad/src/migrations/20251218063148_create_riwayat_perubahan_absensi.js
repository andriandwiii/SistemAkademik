/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("riwayat_perubahan_absensi", (table) => {
    table.increments("ID").primary();
    
    // Relasi ke tabel absensi_siswa
    table.string("ABSENSI_ID", 20).notNullable()
      .references("ABSENSI_ID").inTable("absensi_siswa")
      .onDelete("CASCADE");

    table.string("STATUS_LAMA", 20);
    table.string("STATUS_BARU", 20);
    table.text("ALASAN");

    // Menggunakan NIP (String) sesuai standarmu tadi
    table.string("DIUBAH_OLEH_ID", 20)
      .references("NIP").inTable("master_guru")
      .onDelete("SET NULL");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("riwayat_perubahan_absensi");
}