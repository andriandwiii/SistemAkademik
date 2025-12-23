import { db } from "../core/config/knex.js";

const table = "mapping_mapel_rapor";

/** 🔹 Ambil semua mapping berdasarkan Tingkat */
export const getAllByTingkat = async (tingkatanId) => {
  return db("master_mata_pelajaran as m")
    .select(
      "m.ID as MAPEL_ID",
      "m.NAMA_MAPEL",
      "map.ID as MAPPING_ID",
      "map.NAMA_LOKAL",
      "map.KELOMPOK_ID",
      "map.NO_URUT",
      "map.TINGKATAN_ID_REF"
    )
    .leftJoin(`${table} as map`, function () {
      this.on("m.ID", "=", "map.MAPEL_ID")
          .andOn("map.TINGKATAN_ID_REF", "=", db.raw("?", [tingkatanId]));
    })
    .orderByRaw("map.NO_URUT IS NULL, map.NO_URUT ASC, m.NAMA_MAPEL ASC");
};

/** 🔹 Ambil satu data Mapping berdasarkan ID */
export const getMappingById = async (id) => {
  return db(table).where("ID", id).first();
};

/** 🔹 Tambah Mapping Baru (Single) */
export const createMapping = async (data) => {
  const [insertedId] = await db(table).insert({
    TINGKATAN_ID_REF: data.TINGKATAN_ID_REF,
    MAPEL_ID: data.MAPEL_ID,
    NAMA_LOKAL: data.NAMA_LOKAL,
    KELOMPOK_ID: data.KELOMPOK_ID,
    NO_URUT: data.NO_URUT || 0,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getMappingById(insertedId);
};

/** 🔹 Update Mapping (Single) */
export const updateMapping = async (id, data) => {
  await db(table)
    .where("ID", id)
    .update({
      NAMA_LOKAL: data.NAMA_LOKAL,
      KELOMPOK_ID: data.KELOMPOK_ID,
      NO_URUT: data.NO_URUT,
      updated_at: db.fn.now(),
    });
  return getMappingById(id);
};

/** 🔹 Upsert Bulk (Untuk Form Tabel Massal) */
export const upsertBulk = async (tingkatanId, mappings) => {
  return db.transaction(async (trx) => {
    for (const item of mappings) {
      const payload = {
        TINGKATAN_ID_REF: tingkatanId,
        MAPEL_ID: item.MAPEL_ID,
        NAMA_LOKAL: item.NAMA_LOKAL || null,
        KELOMPOK_ID: item.KELOMPOK_ID || null,
        NO_URUT: item.NO_URUT || 0,
        updated_at: db.fn.now(),
      };

      const existing = await trx(table)
        .where({ TINGKATAN_ID_REF: tingkatanId, MAPEL_ID: item.MAPEL_ID })
        .first();

      if (existing) {
        await trx(table).where({ ID: existing.ID }).update(payload);
      } else {
        await trx(table).insert({ ...payload, created_at: db.fn.now() });
      }
    }
  });
};

/** 🔹 Delete Mapping */
export const deleteMapping = async (id) => {
  return db(table).where("ID", id).del();
};