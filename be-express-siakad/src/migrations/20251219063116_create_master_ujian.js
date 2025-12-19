/**
 * Migration: Create Master Ujian
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_ujian", (table) => {
    table.increments("ID").primary();

    // Kode ujian FK ke master_jenis_ujian
    table
      .string("KODE_UJIAN", 10)
      .notNullable()
      .references("KODE_UJIAN")
      .inTable("master_jenis_ujian")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    // Metode ujian (CBT / PBT)
    table.enu("METODE", ["CBT", "PBT"]).notNullable().defaultTo("CBT");

    // Durasi dalam menit
    table.integer("DURASI").notNullable().defaultTo(60);

    // Acak soal (true = Ya, false = Tidak)
    table.boolean("ACAK_SOAL").notNullable().defaultTo(false);

    // Acak jawaban (true = Ya, false = Tidak)
    table.boolean("ACAK_JAWABAN").notNullable().defaultTo(false);

    // Status ujian
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Unik per KODE_UJIAN
    table.unique(["KODE_UJIAN"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_ujian");
}
