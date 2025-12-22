/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("absensi_siswa", (table) => {
    table.increments("ID").primary();
    table.string("ABSENSI_ID", 20).notNullable().unique();

    // Relasi ke Siswa
    table.string("NIS", 20).notNullable()
      .references("NIS").inTable("master_siswa")
      .onDelete("CASCADE").onUpdate("CASCADE");

    // Relasi ke Transaksi Kelas Aktif
    table.string("TRANSAKSI_ID", 20)
      .references("TRANSAKSI_ID").inTable("transaksi_siswa_kelas")
      .onDelete("SET NULL").onUpdate("CASCADE");

    // Snapshot Data Akademik
    table.string("TAHUN_AJARAN_ID", 20).notNullable()
      .references("TAHUN_AJARAN_ID").inTable("master_tahun_ajaran");
    table.string("TINGKATAN_ID", 20);
    table.string("KELAS_ID", 20).references("KELAS_ID").inTable("master_kelas");

    // Data Absensi
    table.date("TANGGAL").notNullable();
    table.enum("STATUS", ["HADIR", "ALPA", "IZIN", "SAKIT", "MEMBOLOS"])
      .defaultTo("HADIR").notNullable();

    // Fitur Khusus BK (BP_BKM)
    table.text("CATATAN_BK"); 
    table.string("LAMPIRAN_DOKUMEN"); 
    table.boolean("PERLU_TINDAKAN").defaultTo(false); 
    table.boolean("SUDAH_DITANGGANI").defaultTo(false); 

    // --- PERBAIKAN: Relasi menggunakan NIP (String) ---
    // Menggunakan .string() karena NIP di master_guru adalah varchar(20)
    table.string("INPUT_OLEH_ID", 20)
      .references("NIP").inTable("master_guru")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.string("VERIFIKASI_BK_ID", 20)
      .references("NIP").inTable("master_guru")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
    // --------------------------------------------------

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.index(["TAHUN_AJARAN_ID", "NIS"], "idx_history_siswa");
    table.index(["TANGGAL", "KELAS_ID"], "idx_rekap_harian");
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("absensi_siswa");
}