/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_ruang", (table) => {
    // Primary key internal
    table.increments("ID").primary(); // ID auto increment untuk sistem

    // Kode ruang unik (bisa dipakai untuk relasi)
    table.string("RUANG_ID", 5).notNullable().unique(); 

    // Data utama
    table.string("NAMA_RUANG", 50).notNullable(); 
    table.string("DESKRIPSI", 255).nullable(); 

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index tambahan
    table.index(["RUANG_ID", "NAMA_RUANG"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_ruang");
}
