import * as TanggalModel from "../models/tanggalRaporModel.js";

/** 🔹 Helper untuk membersihkan format tanggal ISO ke YYYY-MM-DD */
const formatTanggalDB = (dateInput) => {
  if (!dateInput) return null;
  // Jika formatnya ISO (ada huruf T), ambil 10 karakter pertama
  if (typeof dateInput === 'string' && dateInput.includes('T')) {
    return dateInput.split('T')[0];
  }
  // Jika formatnya sudah objek Date
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }
  return dateInput;
};

export const getTanggalRapor = async (req, res) => {
  try {
    const data = await TanggalModel.getAll();
    res.json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const saveTanggalRapor = async (req, res) => {
  try {
    const data = req.body;
    
    // 1. Bersihkan format tanggal sebelum simpan
    if (data.TANGGAL_CETAK) {
      data.TANGGAL_CETAK = formatTanggalDB(data.TANGGAL_CETAK);
    }

    // 2. Validasi duplikasi semester
    const existing = await TanggalModel.getBySemester(data.SEMESTER);
    if (existing) {
      return res.status(400).json({ status: "99", message: "Data semester ini sudah ada!" });
    }

    await TanggalModel.create(data);
    res.json({ status: "00", message: "Berhasil Menyimpan Data Tanggal" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const updateTanggalRapor = async (req, res) => {
  try {
    const data = req.body;

    // Bersihkan format tanggal sebelum update
    if (data.TANGGAL_CETAK) {
      data.TANGGAL_CETAK = formatTanggalDB(data.TANGGAL_CETAK);
    }

    await TanggalModel.update(req.params.id, data);
    res.json({ status: "00", message: "Data Berhasil Diperbarui" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const getPreviewTtd = async (req, res) => {
  try {
    const { semester, kelas_id } = req.query;
    const result = await TanggalModel.getPreviewConfig(semester, kelas_id);

    if (!result) {
      return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });
    }

    const { config, walas, kepsek } = result;

    res.json({
      status: "00",
      data: {
        tanggal_display: `${config.TEMPAT_CETAK}, ${formatTanggalDB(config.TANGGAL_CETAK)}`,
        wali_kelas: {
          label: config.NIP_WALAS_LABEL,
          nama: walas?.NAMA || "Belum diatur",
          nip: walas?.NIP || "-"
        },
        kepala_sekolah: {
          label_jabatan: config.TULISAN_KS,
          label_nip: config.NIP_KEPSEK_LABEL,
          nama: kepsek?.NAMA || "Belum diatur",
          nip: kepsek?.NIP || "-"
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const deleteTanggalRapor = async (req, res) => {
  try {
    await TanggalModel.remove(req.params.id);
    res.json({ status: "00", message: "Data Berhasil Dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};