import { db } from "../core/config/knex.js";
import * as JadwalModel from "../models/jadwalModel.js";

// Ambil semua jadwal
export const getAllJadwal = async (req, res) => {
  try {
    const data = await JadwalModel.getAllJadwal();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Tambah jadwal
export const createJadwal = async (req, res) => {
  try {
    const { KELAS_ID, MAPEL_KELAS_ID, HARI_ID, JAM_MULAI, JAM_SELESAI } = req.body;

    if (!KELAS_ID || !MAPEL_KELAS_ID || !HARI_ID || !JAM_MULAI || !JAM_SELESAI) {
      return res.status(400).json({ status: "error", message: "Semua field wajib diisi" });
    }

    const data = await JadwalModel.createJadwal({
      KELAS_ID,
      MAPEL_KELAS_ID,
      HARI_ID,
      JAM_MULAI,
      JAM_SELESAI,
    });

    res.status(201).json({
      status: "success",
      message: "Jadwal berhasil ditambahkan",
      data,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update jadwal
export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { KELAS_ID, MAPEL_KELAS_ID, HARI_ID, JAM_MULAI, JAM_SELESAI } = req.body;

    const updated = await JadwalModel.updateJadwal(id, {
      KELAS_ID,
      MAPEL_KELAS_ID,
      HARI_ID,
      JAM_MULAI,
      JAM_SELESAI,
    });

    if (!updated) {
      return res.status(404).json({ status: "error", message: "Jadwal tidak ditemukan" });
    }

    res.status(200).json({
      status: "success",
      message: "Jadwal berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ambil jadwal by ID
export const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await JadwalModel.getJadwalById(id);

    if (!data) {
      return res.status(404).json({ status: "error", message: "Jadwal tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ambil jadwal per kelas
export const getJadwalByKelas = async (req, res) => {
  try {
    const { kelasId } = req.params;

    const data = await db("t_jadwal")
      .leftJoin("m_kelas", "t_jadwal.KELAS_ID", "m_kelas.KELAS_ID")
      .leftJoin("master_tingkatan", "m_kelas.TINGKATAN_ID", "master_tingkatan.TINGKATAN_ID")
      .leftJoin("master_jurusan", "m_kelas.JURUSAN_ID", "master_jurusan.JURUSAN_ID")
      .leftJoin("t_mapel_kelas", "t_jadwal.MAPEL_KELAS_ID", "t_mapel_kelas.MAPEL_KELAS_ID")
      .leftJoin("master_mata_pelajaran", "t_mapel_kelas.MAPEL_ID", "master_mata_pelajaran.MAPEL_ID")
      .leftJoin("m_guru", "t_mapel_kelas.GURU_ID", "m_guru.GURU_ID")
      .leftJoin("master_hari", "t_jadwal.HARI_ID", "master_hari.HARI_ID")
      .select(
        "t_jadwal.*",
        "m_kelas.NAMA_KELAS",
        "master_tingkatan.TINGKATAN",
        "master_jurusan.NAMA_JURUSAN",
        "master_mata_pelajaran.NAMA_MAPEL",
        "t_mapel_kelas.KODE_MAPEL",
        "m_guru.NAMA as NAMA_GURU",
        "master_hari.NAMA_HARI"
      )
      .where("t_jadwal.KELAS_ID", kelasId);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ambil jadwal per guru
export const getJadwalByGuru = async (req, res) => {
  try {
    const { guruId } = req.params;

    const data = await db("t_jadwal")
      .leftJoin("m_kelas", "t_jadwal.KELAS_ID", "m_kelas.KELAS_ID")
      .leftJoin("master_tingkatan", "m_kelas.TINGKATAN_ID", "master_tingkatan.TINGKATAN_ID")
      .leftJoin("master_jurusan", "m_kelas.JURUSAN_ID", "master_jurusan.JURUSAN_ID")
      .leftJoin("t_mapel_kelas", "t_jadwal.MAPEL_KELAS_ID", "t_mapel_kelas.MAPEL_KELAS_ID")
      .leftJoin("master_mata_pelajaran", "t_mapel_kelas.MAPEL_ID", "master_mata_pelajaran.MAPEL_ID")
      .leftJoin("m_guru", "t_mapel_kelas.GURU_ID", "m_guru.GURU_ID")
      .leftJoin("master_hari", "t_jadwal.HARI_ID", "master_hari.HARI_ID")
      .select(
        "t_jadwal.*",
        "m_kelas.NAMA_KELAS",
        "master_tingkatan.TINGKATAN",
        "master_jurusan.NAMA_JURUSAN",
        "master_mata_pelajaran.NAMA_MAPEL",
        "t_mapel_kelas.KODE_MAPEL",
        "m_guru.NAMA as NAMA_GURU",
        "master_hari.NAMA_HARI"
      )
      .where("t_mapel_kelas.GURU_ID", guruId);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ambil jadwal per hari
export const getJadwalByHari = async (req, res) => {
  try {
    const { hariId } = req.params;

    const data = await db("t_jadwal")
      .leftJoin("m_kelas", "t_jadwal.KELAS_ID", "m_kelas.KELAS_ID")
      .leftJoin("master_tingkatan", "m_kelas.TINGKATAN_ID", "master_tingkatan.TINGKATAN_ID")
      .leftJoin("master_jurusan", "m_kelas.JURUSAN_ID", "master_jurusan.JURUSAN_ID")
      .leftJoin("t_mapel_kelas", "t_jadwal.MAPEL_KELAS_ID", "t_mapel_kelas.MAPEL_KELAS_ID")
      .leftJoin("master_mata_pelajaran", "t_mapel_kelas.MAPEL_ID", "master_mata_pelajaran.MAPEL_ID")
      .leftJoin("m_guru", "t_mapel_kelas.GURU_ID", "m_guru.GURU_ID")
      .leftJoin("master_hari", "t_jadwal.HARI_ID", "master_hari.HARI_ID")
      .select(
        "t_jadwal.*",
        "m_kelas.NAMA_KELAS",
        "master_tingkatan.TINGKATAN",
        "master_jurusan.NAMA_JURUSAN",
        "master_mata_pelajaran.NAMA_MAPEL",
        "t_mapel_kelas.KODE_MAPEL",
        "m_guru.NAMA as NAMA_GURU",
        "master_hari.NAMA_HARI"
      )
      .where("t_jadwal.HARI_ID", hariId);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ambil siswa per jadwal
export const getSiswaByJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await db("t_jadwal").where({ JADWAL_ID: id }).first();
    if (!jadwal) return res.status(404).json({ status: "error", message: "Jadwal tidak ditemukan" });

    const siswaList = await db("transaksi_siswa_kelas AS t")
      .join("m_siswa AS s", "t.SISWA_ID", "s.SISWA_ID")
      .select("s.SISWA_ID", "s.NAMA", "t.STATUS", "t.TAHUN_AJARAN")
      .where("t.KELAS_ID", jadwal.KELAS_ID);

    res.status(200).json({ status: "success", data: siswaList });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Hapus jadwal
export const deleteJadwal = async (req, res) => {
  try {
    const deleted = await JadwalModel.deleteJadwal(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Jadwal tidak ditemukan" });

    res.status(200).json({ status: "success", message: "Jadwal berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
