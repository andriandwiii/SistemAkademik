import * as AbsensiModel from "../models/absensiModel.js";

/* --------------------------- ABSENSI SISWA --------------------------- */
export const getAllAbsensiSiswa = async (req, res) => {
  try {
    const data = await AbsensiModel.getAllAbsensiSiswa();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createAbsensiSiswa = async (req, res) => {
  try {
    const { SISWA_ID, JADWAL_ID, TANGGAL, JAM_ABSEN, STATUS, KETERANGAN } = req.body;
    if (!SISWA_ID || !JADWAL_ID || !TANGGAL || !JAM_ABSEN) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const absensi = await AbsensiModel.createAbsensiSiswa({
      SISWA_ID,
      JADWAL_ID,
      TANGGAL,
      JAM_ABSEN,
      STATUS,
      KETERANGAN,
    });

    res.status(201).json({ status: "success", data: absensi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateAbsensiSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { SISWA_ID, JADWAL_ID, TANGGAL, JAM_ABSEN, STATUS, KETERANGAN } = req.body;

    const updated = await AbsensiModel.updateAbsensiSiswa(id, {
      SISWA_ID,
      JADWAL_ID,
      TANGGAL,
      JAM_ABSEN,
      STATUS,
      KETERANGAN,
    });

    if (!updated)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteAbsensiSiswa = async (req, res) => {
  try {
    const deleted = await AbsensiModel.deleteAbsensiSiswa(req.params.id);
    if (!deleted)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/* --------------------------- ABSENSI GURU --------------------------- */
export const getAllAbsensiGuru = async (req, res) => {
  try {
    const data = await AbsensiModel.getAllAbsensiGuru();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createAbsensiGuru = async (req, res) => {
  try {
    const {
      GURU_ID,
      TANGGAL,
      JAM_MASUK,
      JAM_PULANG,
      LATITUDE,
      LONGITUDE,
      JARAK_SEKOLAH,
      STATUS,
      CATATAN,
    } = req.body;

    if (!GURU_ID || !TANGGAL) {
      return res.status(400).json({ status: "error", message: "Field wajib diisi" });
    }

    const absensi = await AbsensiModel.createAbsensiGuru({
      GURU_ID,
      TANGGAL,
      JAM_MASUK,
      JAM_PULANG,
      LATITUDE,
      LONGITUDE,
      JARAK_SEKOLAH,
      STATUS,
      CATATAN,
    });

    res.status(201).json({ status: "success", data: absensi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateAbsensiGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      GURU_ID,
      TANGGAL,
      JAM_MASUK,
      JAM_PULANG,
      LATITUDE,
      LONGITUDE,
      JARAK_SEKOLAH,
      STATUS,
      CATATAN,
    } = req.body;

    const updated = await AbsensiModel.updateAbsensiGuru(id, {
      GURU_ID,
      TANGGAL,
      JAM_MASUK,
      JAM_PULANG,
      LATITUDE,
      LONGITUDE,
      JARAK_SEKOLAH,
      STATUS,
      CATATAN,
    });

    if (!updated)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteAbsensiGuru = async (req, res) => {
  try {
    const deleted = await AbsensiModel.deleteAbsensiGuru(req.params.id);
    if (!deleted)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
