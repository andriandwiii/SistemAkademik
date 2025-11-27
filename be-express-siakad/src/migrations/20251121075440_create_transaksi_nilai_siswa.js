/**
 * Migration: Create Tabel Transaksi Nilai
 * * Tabel ini menyimpan angka nilai siswa.
 * Data Predikat & KKM diambil otomatis via JOIN berdasarkan (KELAS + MAPEL + TAHUN).
 * * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("transaksi_nilai", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Identitas Siswa (Menggunakan NIS)
    table.string("NIS", 20).notNullable()
         .references("NIS").inTable("master_siswa")
         .onDelete("CASCADE") 
         .onUpdate("CASCADE");

    // 3. Kunci Penghubung (Foreign Keys)
    // Ke Master Kelas
    table.string("KELAS_ID", 6).notNullable()
         .references("KELAS_ID").inTable("master_kelas")
         .onDelete("RESTRICT")
         .onUpdate("CASCADE");

    // Ke Master Mapel
    table.string("KODE_MAPEL", 8).notNullable()
         .references("KODE_MAPEL").inTable("master_mata_pelajaran")
         .onDelete("RESTRICT")
         .onUpdate("CASCADE");

    // Ke Master Tahun Ajaran
    table.string("TAHUN_AJARAN_ID", 10).notNullable()
         .references("TAHUN_AJARAN_ID").inTable("master_tahun_ajaran")
         .onDelete("RESTRICT")
         .onUpdate("CASCADE");

    // Semester (1 = Ganjil, 2 = Genap)
    table.string("SEMESTER", 1).defaultTo("1");

    // 4. Data Nilai (Angka Murni)
    // Rentang nilai 0-100. Boleh NULL jika belum dinilai.
    table.integer("NILAI_P").nullable().comment("Nilai Pengetahuan");
    table.integer("NILAI_K").nullable().comment("Nilai Keterampilan");

    // 5. Metadata
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // 6. Constraints (Aturan Unik)
    // Mencegah duplikasi nilai untuk siswa yang sama di mapel yang sama
    table.unique(
        ["NIS", "KODE_MAPEL", "KELAS_ID", "TAHUN_AJARAN_ID", "SEMESTER"], 
        "uniq_transaksi_nilai"
    );

    // Indexing untuk performa query
    table.index(["KELAS_ID", "KODE_MAPEL", "TAHUN_AJARAN_ID"], "idx_nilai_kelas");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("transaksi_nilai");
}