/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_guru", (table) => {
    // Primary key internal
    table.bigIncrements("GURU_ID").primary();

    // Relasi ke tabel users — pakai email, bukan user_id
    table
      .string("EMAIL", 120)
      .notNullable()
      .unique()
      .references("email")
      .inTable("users")
      .onDelete("CASCADE");

    // Data pokok
    table.string("NIP", 20).unique().notNullable(); // Nomor Induk Pegawai
    table.string("NAMA", 120).notNullable();
    table.string("PANGKAT", 50).nullable();
    table.string("JABATAN", 50).nullable();
    table
      .enu("STATUS_KEPEGAWAIAN", ["Aktif", "Cuti", "Pensiun"])
      .defaultTo("Aktif");

    // Data pribadi
    table.enu("GENDER", ["L", "P"]).notNullable();
    table.date("TGL_LAHIR").nullable();
    table.string("TEMPAT_LAHIR", 120).nullable();
    table.string("NO_TELP", 20).nullable();
    table.string("ALAMAT", 255).nullable();
    table.string("FOTO", 255).nullable();

    // Data pendidikan terakhir
    table.string("PENDIDIKAN_TERAKHIR", 120).nullable();
    table.integer("TAHUN_LULUS", 4).nullable();
    table.string("UNIVERSITAS", 120).nullable();
    table.string("NO_SERTIFIKAT_PENDIDIK", 50).nullable();
    table.integer("TAHUN_SERTIFIKAT").nullable();

    // Data akademik dan penugasan
    table.string("MAPEL_DIAMPU", 150).nullable();

    // timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // index
    table.index(["NIP", "NAMA", "EMAIL"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_guru");
}
