// file: 20251112034222_add_tahun_ajaran_semester_to_master_jadwal.js
export async function up(knex) {
  await knex.schema.alterTable("master_jadwal", (table) => {
    table
      .string("TAHUN_AJARAN_ID", 10)
      .notNullable()
      .defaultTo("TA2025")
      .references("TAHUN_AJARAN_ID")
      .inTable("master_tahun_ajaran")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.enu("SEMESTER", ["GANJIL", "GENAP"]).notNullable().defaultTo("GANJIL");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("master_jadwal", (table) => {
    // Hapus constraint FK dulu, baru hapus kolom
    table.dropForeign("TAHUN_AJARAN_ID");
    table.dropColumn("TAHUN_AJARAN_ID");

    table.dropColumn("SEMESTER");
  });
}
