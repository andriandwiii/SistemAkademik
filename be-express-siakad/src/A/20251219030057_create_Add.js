/**
 * Migration: Add KATEGORI_ID to transaksi_siswa_kelas
 * Default: KAT002 (Jalur Reguler) untuk data existing
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  console.log("🔄 Menambahkan kolom KATEGORI_ID ke transaksi_siswa_kelas...");
  
  // 1. Tambahkan kolom KATEGORI_ID (nullable dulu)
  await knex.schema.table("transaksi_siswa_kelas", (table) => {
    table.string("KATEGORI_ID", 10).nullable();
  });

  console.log("✅ Kolom KATEGORI_ID ditambahkan");

  // 2. Set default value untuk data yang sudah ada
  // Menggunakan KAT002 (Jalur Reguler) sebagai default
  const updated = await knex("transaksi_siswa_kelas")
    .whereNull("KATEGORI_ID")
    .update({ KATEGORI_ID: "KAT002" });

  console.log(`✅ ${updated} record di-update dengan kategori default: KAT002 (Jalur Reguler)`);

  // 3. Ubah kolom menjadi NOT NULL setelah semua data terisi
  await knex.schema.alterTable("transaksi_siswa_kelas", (table) => {
    table.string("KATEGORI_ID", 10).notNullable().alter();
  });

  console.log("✅ Kolom KATEGORI_ID diubah menjadi NOT NULL");

  // 4. Tambahkan foreign key ke master_kategori_siswa
  await knex.schema.table("transaksi_siswa_kelas", (table) => {
    table
      .foreign("KATEGORI_ID")
      .references("KATEGORI_ID")
      .inTable("master_kategori_siswa")
      .onDelete("RESTRICT") // Tidak boleh hapus kategori jika masih dipakai
      .onUpdate("CASCADE");
  });

  console.log("✅ Foreign key KATEGORI_ID berhasil ditambahkan");
  console.log("\n🎉 Migration selesai! Struktur tabel transaksi_siswa_kelas sudah update");
  console.log("📝 Catatan: Semua siswa existing di-set sebagai 'Jalur Reguler' (KAT002)");
  console.log("   Anda bisa update manual jika ada siswa dengan kategori lain.");
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  console.log("🔄 Menghapus kolom KATEGORI_ID dari transaksi_siswa_kelas...");
  
  await knex.schema.table("transaksi_siswa_kelas", (table) => {
    table.dropForeign("KATEGORI_ID");
    table.dropColumn("KATEGORI_ID");
  });
  
  console.log("✅ Kolom KATEGORI_ID berhasil dihapus");
}