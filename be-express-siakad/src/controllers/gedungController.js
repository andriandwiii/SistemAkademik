import * as GedungModel from "../models/gedungModel.js";

export const getAllGedung = async (req, res) => {
  try {
    const gedung = await GedungModel.getAllGedung();
    res.status(200).json({ status: "success", data: gedung });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getGedungById = async (req, res) => {
  try {
    const gedung = await GedungModel.getGedungById(req.params.id);
    if (!gedung) return res.status(404).json({ status: "error", message: "Gedung tidak ditemukan" });
    res.status(200).json({ status: "success", data: gedung });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createGedung = async (req, res) => {
  try {
    const { NAMA_GEDUNG, LOKASI } = req.body;

    if (!NAMA_GEDUNG || NAMA_GEDUNG.trim() === "")
      return res.status(400).json({ status: "error", message: "Nama gedung wajib diisi" });

    if (NAMA_GEDUNG.length < 3)
      return res.status(400).json({ status: "error", message: "Nama gedung minimal 3 huruf" });

    if (!LOKASI || LOKASI.trim() === "")
      return res.status(400).json({ status: "error", message: "Lokasi wajib diisi" });

    if (LOKASI.length < 3)
      return res.status(400).json({ status: "error", message: "Lokasi minimal 3 huruf" });

    const newGedung = await GedungModel.createGedung({ NAMA_GEDUNG, LOKASI });
    res.status(201).json({ status: "success", message: "Gedung berhasil ditambahkan", data: newGedung });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateGedung = async (req, res) => {
  try {
    const { NAMA_GEDUNG, LOKASI } = req.body;

    if (!NAMA_GEDUNG || NAMA_GEDUNG.trim() === "")
      return res.status(400).json({ status: "error", message: "Nama gedung wajib diisi" });

    if (NAMA_GEDUNG.length < 3)
      return res.status(400).json({ status: "error", message: "Nama gedung minimal 3 huruf" });

    if (!LOKASI || LOKASI.trim() === "")
      return res.status(400).json({ status: "error", message: "Lokasi wajib diisi" });

    if (LOKASI.length < 3)
      return res.status(400).json({ status: "error", message: "Lokasi minimal 3 huruf" });

    const updatedGedung = await GedungModel.updateGedung(req.params.id, { NAMA_GEDUNG, LOKASI });
    if (!updatedGedung)
      return res.status(404).json({ status: "error", message: "Gedung tidak ditemukan" });

    res.status(200).json({ status: "success", message: "Gedung berhasil diperbarui", data: updatedGedung });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteGedung = async (req, res) => {
  try {
    const deleted = await GedungModel.deleteGedung(req.params.id);
    if (!deleted)
      return res.status(404).json({ status: "error", message: "Gedung tidak ditemukan" });

    res.status(200).json({ status: "success", message: "Gedung berhasil dihapus", data: deleted });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
