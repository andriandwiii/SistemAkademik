import {
  getAllKelas,
  getKelasById,
  addKelas,
  updateKelas,
  removeKelas,
} from "../models/kelasModel.js";
import { datetime, status } from "../utils/general.js";

// =======================
// Fetch all kelas
// =======================
export const fetchAllKelas = async (req, res) => {
  try {
    const kelas = await getAllKelas();
    if (!kelas.length) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data kelas kosong",
        datetime: datetime(),
      });
    }
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data kelas berhasil didapatkan",
      datetime: datetime(),
      data: kelas,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Get kelas by ID
// =======================
export const getKelasByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = await getKelasById(id);
    if (!kelas) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data kelas tidak ditemukan",
        datetime: datetime(),
      });
    }
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data kelas berhasil didapatkan",
      datetime: datetime(),
      data: kelas,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Create new kelas
// =======================
export const createNewKelas = async (req, res) => {
  try {
    const { jurusan_id, gedung_id, tingkatan_id, ruang_id } = req.body || {};
    if (!jurusan_id || !gedung_id || !tingkatan_id || !ruang_id) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Jurusan, Gedung, Tingkatan, dan Ruang wajib diisi",
        datetime: datetime(),
      });
    }
    const kelas = await addKelas({ jurusan_id, gedung_id, tingkatan_id, ruang_id });
    return res.status(201).json({
      status: status.SUKSES,
      message: "Kelas berhasil ditambahkan",
      datetime: datetime(),
      data: kelas,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Update kelas
// =======================
export const updateKelasController = async (req, res) => {
  try {
    const { id } = req.params;
    const { jurusan_id, gedung_id, tingkatan_id, ruang_id } = req.body || {};
    if (!jurusan_id || !gedung_id || !tingkatan_id || !ruang_id) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Jurusan, Gedung, Tingkatan, dan Ruang wajib diisi",
        datetime: datetime(),
      });
    }
    const updated = await updateKelas(id, { jurusan_id, gedung_id, tingkatan_id, ruang_id });
    if (!updated) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Kelas tidak ditemukan",
        datetime: datetime(),
      });
    }
    return res.status(200).json({
      status: status.SUKSES,
      message: "Kelas berhasil diupdate",
      datetime: datetime(),
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Delete kelas
// =======================
export const deleteKelasController = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await removeKelas(id);
    if (!removed) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Kelas tidak ditemukan",
        datetime: datetime(),
      });
    }
    return res.status(200).json({
      status: status.SUKSES,
      message: "Kelas berhasil dihapus",
      datetime: datetime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
