export async function up(knex) {
  return knex.schema.createTable("master_tahun_ajaran", (table) => {
    table.increments("ID").primary(); // Primary Key, Auto Increment

    table.string("TAHUN_AJARAN_ID", 6).notNullable().index(); 
    // Contoh: "TA2425"

    table.string("NAMA_TAHUN_AJARAN", 50).notNullable(); 
    // Contoh: "Tahun Ajaran 2024/2025"

    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Tidak Aktif");
    // Default: Tidak Aktif

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_tahun_ajaran");
}