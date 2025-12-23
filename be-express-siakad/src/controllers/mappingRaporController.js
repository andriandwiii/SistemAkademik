import * as MappingModel from "../models/mappingRaporModel.js";

export const getAll = async (req, res) => {
  try {
    const { tingkatan_id } = req.query;
    if (!tingkatan_id) {
      return res.status(400).json({ status: "99", message: "Parameter tingkatan_id diperlukan" });
    }
    const data = await MappingModel.getAllByTingkat(tingkatan_id);
    res.json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await MappingModel.getMappingById(req.params.id);
    if (!data) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });
    res.json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await MappingModel.createMapping(req.body);
    res.json({ status: "00", message: "Data berhasil ditambahkan", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await MappingModel.updateMapping(req.params.id, req.body);
    res.json({ status: "00", message: "Data berhasil diperbarui", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const saveBulk = async (req, res) => {
  try {
    const { tingkatan_id, mappings } = req.body;
    await MappingModel.upsertBulk(tingkatan_id, mappings);
    res.json({ status: "00", message: "Berhasil memperbarui mapping rapor" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await MappingModel.deleteMapping(req.params.id);
    res.json({ status: "00", message: "Mapping berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};