import { db } from "../core/config/knex.js";

const table = "transaksi_gabung_mapel";

export const getAllGabung = async () => {
  return await db(table)
    .select(
      `${table}.ID`,
      "mi.NAMA_MAPEL as NAMA_MAPEL_INDUK",
      "mi.ID as MAPEL_INDUK_ID",
      "mk.NAMA_MAPEL as NAMA_MAPEL_KOMPONEN",
      "mk.ID as MAPEL_KOMPONEN_ID",
      "j.NAMA_JURUSAN",
      "j.id as JURUSAN_ID_REF",
      `${table}.KETERANGAN`
    )
    .join("master_mata_pelajaran as mi", `${table}.MAPEL_INDUK_ID`, "mi.ID")
    .join("master_mata_pelajaran as mk", `${table}.MAPEL_KOMPONEN_ID`, "mk.ID")
    .leftJoin("master_jurusan as j", `${table}.JURUSAN_ID_REF`, "j.id")
    .orderBy(`${table}.ID`, "desc");
};

export const getGabungById = async (id) => {
  return await db(table).where({ ID: id }).first();
};

export const createGabungBulk = async (payload) => {
  const { MAPEL_INDUK_ID, MAPEL_KOMPONEN_IDS, JURUSAN_ID_REF, KETERANGAN } = payload;
  const dataToInsert = MAPEL_KOMPONEN_IDS.map((komponenId) => ({
    MAPEL_INDUK_ID,
    MAPEL_KOMPONEN_ID: komponenId,
    JURUSAN_ID_REF,
    KETERANGAN,
  }));
  return await db(table).insert(dataToInsert);
};

export const updateGabung = async (id, data) => {
  return await db(table).where({ ID: id }).update(data);
};

export const deleteGabung = async (id) => {
  return await db(table).where({ ID: id }).del();
};