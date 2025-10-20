import * as MasterAsetModel from "../models/masterAsetSekolahModel.js";

/** Ambil semua data aset sekolah */
export const getAllAset = async (req, res) => {
  try {
    const data = await MasterAsetModel.getAllAset();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah data aset sekolah */
export const createAset = async (req, res) => {
  try {
    const {
      KODE_ASET,
      NAMA_ASET,
      JENIS_ASET,
      JUMLAH,
      KONDISI,
      GEDUNG_ID,
      SUMBER_DANA,
      TANGGAL_PEMBELIAN,
      HARGA_SATUAN,
      TOTAL_HARGA,
      KETERANGAN,
      STATUS,
    } = req.body;

    // Validasi field wajib
    if (!KODE_ASET || !NAMA_ASET || !JENIS_ASET) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const aset = await MasterAsetModel.createAset({
      KODE_ASET,
      NAMA_ASET,
      JENIS_ASET,
      JUMLAH,
      KONDISI,
      GEDUNG_ID,
      SUMBER_DANA,
      TANGGAL_PEMBELIAN,
      HARGA_SATUAN,
      TOTAL_HARGA,
      KETERANGAN,
      STATUS,
    });

    res.status(201).json({
      status: "success",
      message: "Data aset berhasil ditambahkan",
      data: aset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update data aset sekolah */
export const updateAset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      KODE_ASET,
      NAMA_ASET,
      JENIS_ASET,
      JUMLAH,
      KONDISI,
      GEDUNG_ID,
      SUMBER_DANA,
      TANGGAL_PEMBELIAN,
      HARGA_SATUAN,
      TOTAL_HARGA,
      KETERANGAN,
      STATUS,
    } = req.body;

    // Validasi field wajib
    if (!KODE_ASET || !NAMA_ASET || !JENIS_ASET) {
      return res
        .status(400)
        .json({ status: "error", message: "Field wajib diisi" });
    }

    const aset = await MasterAsetModel.updateAset(id, {
      KODE_ASET,
      NAMA_ASET,
      JENIS_ASET,
      JUMLAH,
      KONDISI,
      GEDUNG_ID,
      SUMBER_DANA,
      TANGGAL_PEMBELIAN,
      HARGA_SATUAN,
      TOTAL_HARGA,
      KETERANGAN,
      STATUS,
    });

    if (!aset)
      return res
        .status(404)
        .json({ status: "error", message: "Data aset tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Data aset berhasil diperbarui",
      data: aset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil aset sekolah berdasarkan ID */
export const getAsetById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MasterAsetModel.getAsetById(id);

    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "Data aset tidak ditemukan" });
    }

    res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus data aset sekolah */
export const deleteAset = async (req, res) => {
  try {
    const deleted = await MasterAsetModel.deleteAset(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Data aset tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Data aset berhasil dihapus",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
