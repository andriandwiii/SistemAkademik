/**
 * Migration: Create Master Siswa (relasi pakai email dari tabel users)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('master_siswa', (table) => {
    // ID internal auto increment
    table.bigIncrements('SISWA_ID').primary();

    // Relasi ke tabel users — berdasarkan email, bukan ID
    table
      .string('EMAIL', 120)
      .notNullable()
      .unique()
      .references('email')
      .inTable('users')
      .onDelete('CASCADE');

    // Data identitas siswa
    table.string('NIS', 10).unique().notNullable();
    table.string('NISN', 10).unique().notNullable();
    table.string('NAMA', 120).notNullable();
    table.enu('GENDER', ['L', 'P']).notNullable();
    table.string('TEMPAT_LAHIR', 100);
    table.date('TGL_LAHIR');
    table.string('AGAMA', 50);
    table.text('ALAMAT');
    table.string('NO_TELP', 20);

    // Status siswa
    table.enu('STATUS', ['Aktif', 'Lulus', 'Pindah', 'Nonaktif']).defaultTo('Aktif');

    // Data tambahan
    table.string('GOL_DARAH', 5);
    table.integer('TINGGI'); // cm
    table.integer('BERAT');  // kg
    table.string('KEBUTUHAN_KHUSUS', 120);
    table.string('FOTO', 255);

    // Data orang tua / wali
    table.string('NAMA_AYAH', 120);
    table.string('PEKERJAAN_AYAH', 100);
    table.string('PENDIDIKAN_AYAH', 100);
    table.string('ALAMAT_AYAH');
    table.string('NO_TELP_AYAH', 20);

    table.string('NAMA_IBU', 120);
    table.string('PEKERJAAN_IBU', 100);
    table.string('PENDIDIKAN_IBU', 100);
    table.string('ALAMAT_IBU');
    table.string('NO_TELP_IBU', 20);

    table.string('NAMA_WALI', 120);
    table.string('PEKERJAAN_WALI', 100);
    table.string('PENDIDIKAN_WALI', 100);
    table.string('ALAMAT_WALI');
    table.string('NO_TELP_WALI', 20);

    // Data sistem
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

export const down = async function (knex) {
  await knex.schema.dropTableIfExists('master_siswa');
};
