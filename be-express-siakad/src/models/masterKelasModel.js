import { db } from "../core/config/knex.js";

// Ambil semua kelas
export const getAllKelas = async () => db("master_kelas").select("*");

// Ambil kelas berdasarkan ID
export const getKelasById = async (id) => db("master_kelas").where({ KELAS_ID: id }).first();

// Ambil kelas berdasarkan kode kelas
export const getKelasByKode = async (kode_kelas) =>
  db("master_kelas").where({ KODE_KELAS: kode_kelas }).first();

// Tambah kelas baru
export const addKelas = async ({ kode_kelas, tingkat, jurusan, nama_kelas, status }) => {
  const [KELAS_ID] = await db("master_kelas").insert({
    KODE_KELAS: kode_kelas,
    TINGKAT: tingkat,
    JURUSAN: jurusan,
    NAMA_KELAS: nama_kelas,
    STATUS: status,
  });
  return db("master_kelas").where({ KELAS_ID }).first();
};

// Update kelas
export const updateKelas = async (id, data) =>
  db("master_kelas").where({ KELAS_ID: id }).update({
    KODE_KELAS: data.kode_kelas,
    TINGKAT: data.tingkat,
    JURUSAN: data.jurusan,
    NAMA_KELAS: data.nama_kelas,
    STATUS: data.status,
  }).returning("*");

// Hapus kelas
export const removeKelas = async (id) =>
  db("master_kelas").where({ KELAS_ID: id }).del();
