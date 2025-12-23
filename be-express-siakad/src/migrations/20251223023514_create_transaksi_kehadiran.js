/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('transaksi_kehadiran', (table) => {
    table.increments('ID').primary();
    
    // Identitas Siswa dan Kelas
    table.string('NIS', 20).notNullable();
    table.string('KELAS_ID', 20).notNullable();
    
    // Periode (Sesuai panduan e-Rapor untuk rekap 1 semester)
    table.string('TAHUN_AJARAN_ID', 10).notNullable(); // Contoh: TA2526
    table.enum('SEMESTER', ['1', '2']).notNullable();
    
    // Data Ketidakhadiran (Sesuai Gambar 237)
    table.integer('SAKIT').defaultTo(0).comment('Jumlah hari sakit');
    table.integer('IZIN').defaultTo(0).comment('Jumlah hari izin');
    table.integer('ALPA').defaultTo(0).comment('Jumlah hari tanpa keterangan');
    
    // Metadata
    table.timestamps(true, true);

    // Foreign Keys (Opsional, sesuaikan dengan tabel mastermu)
    // table.foreign('NIS').references('master_siswa.NIS').onDelete('CASCADE');
    
    // Unique Constraint agar satu siswa tidak punya 2 rekap di semester yang sama
    table.unique(['NIS', 'TAHUN_AJARAN_ID', 'SEMESTER'], 'uniq_kehadiran_siswa');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTableIfExists('transaksi_kehadiran');
};