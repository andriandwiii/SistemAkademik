import {
  getAllKelas,
  getKelasById,
  addKelas,
  updateKelas,
  removeKelas,
} from "../models/masterKelasModel.js";

import {
  addMasterKelasSchema,
  updateMasterKelasSchema,
} from "../scemas/masterKelasSchema.js";

import { datetime, status } from "../utils/general.js";

// =======================
// Fetch all kelas
// =======================
export const fetchAllKelas = async (req, res) => {
  try {
    const kelas = await getAllKelas();

    if (!kelas || kelas.length === 0) {
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
      kelas,
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
      kelas,
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
    const validation = addMasterKelasSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { kode_kelas, tingkat, jurusan, nama_kelas, status: kelasStatus } =
      validation.data;

    const kelas = await addKelas({
      kode_kelas,
      tingkat,
      jurusan,
      nama_kelas,
      status: kelasStatus,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Kelas berhasil ditambahkan",
      datetime: datetime(),
      kelas,
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
    const validation = updateMasterKelasSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { kode_kelas, tingkat, jurusan, nama_kelas, status: kelasStatus } =
      validation.data;

    await updateKelas(id, {
      kode_kelas,
      tingkat,
      jurusan,
      nama_kelas,
      status: kelasStatus,
    });

    const updatedKelas = await getKelasById(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Kelas berhasil diupdate",
      datetime: datetime(),
      kelas: updatedKelas,
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

    await removeKelas(id);

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
