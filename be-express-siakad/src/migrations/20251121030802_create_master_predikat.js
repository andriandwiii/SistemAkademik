/**
 * Migration: Create Master Predikat (Deskripsi Only) + Kelas ID
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_predikat", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Kode Identitas (Misal: PRED-MTK-XMA-2025)
    table.string("KODE_PREDIKAT", 50).notNullable().unique();

    // 3. Kunci Relasi
    table.string("KODE_MAPEL", 20).notNullable().index();      
    table.string("TAHUN_AJARAN_ID", 20).notNullable().index(); 
    
    // Level Umum
    table.string("TINGKATAN_ID", 20).notNullable().index();    
    table.string("JURUSAN_ID", 20).nullable().index();         

    // === TAMBAHAN: KELAS ID ===
    // Diambil dari tabel master_kelas (contoh data Anda: XMA, XMB, dst)
    // Saya buat nullable, jadi kalau NULL berarti berlaku untuk semua kelas di tingkatan itu.
    // Kalau diisi, berarti khusus untuk kelas itu saja.
    table.string("KELAS_ID", 20).nullable().index().comment("Kode Kelas (misal: XMA). Kosongkan jika berlaku umum.");

    // ============================================
    // 4. ISI DESKRIPSI (PURE TEXT, TANPA ANGKA)
    // ============================================
    table.text("DESKRIPSI_A").nullable().comment("Teks rapor jika nilai A (Sangat Baik)");
    table.text("DESKRIPSI_B").nullable().comment("Teks rapor jika nilai B (Baik)");
    table.text("DESKRIPSI_C").nullable().comment("Teks rapor jika nilai C (Cukup)");
    table.text("DESKRIPSI_D").nullable().comment("Teks rapor jika nilai D (Kurang)");

    // ============================================
    // 5. Metadata
    // ============================================
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
  return knex.schema.dropTableIfExists("master_predikat");
}