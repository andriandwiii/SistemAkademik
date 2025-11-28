/**
 * Migration: Create Tabel Absensi Guru
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("absensi_guru", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Kode Unik Absen (Format: AGxxxxx)
    // HAPUS defaultTo(UUID) karena kita akan isi manual dari backend (Model)
    table.string("KODE", 20) 
         .notNullable()
         .unique();

    // 3. Relasi ke Master Guru (Menggunakan NIP)
    table.string("NIP", 50).notNullable()
         .references("NIP").inTable("master_guru")
         .onDelete("CASCADE")
         .onUpdate("CASCADE");

    // 4. Waktu Absensi
    table.date("TANGGAL").notNullable();

    // Data Masuk
    table.time("JAM_MASUK").nullable();
    table.string("LOKASI_MASUK", 100).nullable();
    table.string("FOTO_MASUK", 255).nullable();
    table.text("TANDA_TANGAN_MASUK", "longtext").nullable();

    // Data Pulang
    table.time("JAM_KELUAR").nullable();
    table.string("LOKASI_KELUAR", 100).nullable();
    table.text("TANDA_TANGAN_KELUAR", "longtext").nullable();

    // 5. Status & Keterangan
    table.enum("STATUS", ["Hadir", "Izin", "Sakit", "Alpa", "Dinas Luar"])
         .notNullable()
         .defaultTo("Hadir");
         
    table.text("KETERANGAN").nullable();
    
    // Flag Terlambat
    table.boolean("TERLAMBAT").defaultTo(false);

    // 6. Metadata
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // 7. Constraints
    table.unique(["NIP", "TANGGAL"], "uniq_absensi_guru");
    table.index(["TANGGAL", "STATUS"], "idx_laporan_guru");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("absensi_guru");
}