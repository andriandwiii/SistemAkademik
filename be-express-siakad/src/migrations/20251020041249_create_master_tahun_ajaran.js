export async function up(knex) {
  return knex.schema.createTable("master_tahun_ajaran", (table) => {
    table.increments("ID").primary();

    table.string("TAHUN_AJARAN_ID", 20).notNullable().unique(); 
    // Contoh: "TA2024-2025"

    table.string("NAMA_TAHUN_AJARAN", 50).notNullable(); 
    // Contoh: "Tahun Ajaran 2024/2025"

    table.enu("SEMESTER", ["Ganjil", "Genap"]).defaultTo("Ganjil");
    // Semester membantu penjadwalan dan pembagian data akademik

    table.date("TANGGAL_MULAI").nullable();
    table.date("TANGGAL_SELESAI").nullable();

    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Tidak Aktif");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_tahun_ajaran");
}
