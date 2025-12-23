import * as GabungModel from "../models/transaksigabungMapelModel.js";

export const getAll = async (req, res) => {
  try {
    const data = await GabungModel.getAllGabung();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await GabungModel.getGabungById(req.params.id);
    if (!data) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { MAPEL_INDUK_ID, MAPEL_KOMPONEN_IDS } = req.body;
    if (!MAPEL_INDUK_ID || !MAPEL_KOMPONEN_IDS?.length) {
      return res.status(400).json({ status: "99", message: "Induk dan Komponen wajib diisi" });
    }
    await GabungModel.createGabungBulk(req.body);
    res.status(201).json({ status: "00", message: "Berhasil menambahkan penggabungan" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { MAPEL_INDUK_ID, MAPEL_KOMPONEN_ID, JURUSAN_ID_REF, KETERANGAN } = req.body;
    await GabungModel.updateGabung(req.params.id, {
      MAPEL_INDUK_ID,
      MAPEL_KOMPONEN_ID,
      JURUSAN_ID_REF,
      KETERANGAN
    });
    res.status(200).json({ status: "00", message: "Berhasil memperbarui data" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await GabungModel.deleteGabung(req.params.id);
    res.status(200).json({ status: "00", message: "Berhasil menghapus data" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};