/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_gabung_mapel", (table) => {
    table.bigIncrements("ID").primary();

    // Relasi ke Mapel Induk (Contoh: IPA)
    // Mengacu pada master_mata_pelajaran.ID (bigIncrements)
    table.bigInteger("MAPEL_INDUK_ID").unsigned().notNullable();
    table.foreign("MAPEL_INDUK_ID")
         .references("ID")
         .inTable("master_mata_pelajaran")
         .onDelete("CASCADE");

    // Relasi ke Mapel Anggota/Komponen (Contoh: Fisika)
    table.bigInteger("MAPEL_KOMPONEN_ID").unsigned().notNullable();
    table.foreign("MAPEL_KOMPONEN_ID")
         .references("ID")
         .inTable("master_mata_pelajaran")
         .onDelete("CASCADE");

    // Relasi ke Jurusan (Opsional: Untuk membedakan gabungan tiap jurusan)
    // Mengacu pada master_jurusan.id (increments)
    table.integer("JURUSAN_ID_REF").unsigned().nullable();
    table.foreign("JURUSAN_ID_REF")
         .references("id")
         .inTable("master_jurusan")
         .onDelete("SET NULL");

    // Metadata tambahan
    table.string("KETERANGAN", 255).nullable(); // Contoh: "Penggabungan IPA Kurikulum Merdeka"
    
    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index agar pencarian saat kalkulasi nilai rapor cepat
    table.index(["MAPEL_INDUK_ID", "MAPEL_KOMPONEN_ID"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_gabung_mapel");
}