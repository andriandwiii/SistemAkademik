/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_kkm", (table) => {
    table.bigIncrements("ID").primary();
    table.string("KODE_KKM", 20).unique().notNullable();

    // Relasi ke master_mata_pelajaran (foreign key)
    table
      .string("KODE_MAPEL", 8)
      .notNullable()
      .references("KODE_MAPEL")
      .inTable("master_mata_pelajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Kolom nilai KKM dan komponen penilaian
    table.integer("KOMPLEKSITAS").notNullable();
    table.integer("DAYA_DUKUNG").notNullable();
    table.integer("INTAKE").notNullable();
    table.decimal("KKM", 5, 2).notNullable();

    table.string("KETERANGAN", 100);
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    // timestamps otomatis
    table.timestamp("CREATED_AT").defaultTo(knex.fn.now());
    table
      .timestamp("UPDATED_AT")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index
    table.index(["KODE_MAPEL"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_kkm");
}
