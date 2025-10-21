// src/models/masterMataPelajaranModel.js
import { db } from "../core/config/knex.js";

const TABLE_NAME = "master_mata_pelajaran";

export const getAllMataPelajaran = async () => {
  return await db(TABLE_NAME).select("*");
};

export const getMataPelajaranById = async (id) => {
  return await db(TABLE_NAME).where("ID", id).first();
};

export const addMataPelajaran = async (data) => {
  return await db(TABLE_NAME).insert(data);
};

export const updateMataPelajaran = async (id, data) => {
  return await db(TABLE_NAME).where("ID", id).update(data);
};

export const deleteMataPelajaran = async (id) => {
  return await db(TABLE_NAME).where("ID", id).del();
};
