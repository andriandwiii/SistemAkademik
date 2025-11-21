import * as PredikatModel from "../models/masterPredikatModel.js";
import { db } from "../core/config/knex.js";

/** 🔹 Ambil semua data predikat */
export const getAllPredikat = async (req, res) => {
  try {
    const data = await PredikatModel.getAllPredikat();
    res.status(200).json({
      status: "00",
      message: "Data deskripsi predikat berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllPredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Tambah Predikat (Validasi Fleksibel / Cerdas) */
export const createPredikat = async (req, res) => {
  try {
    const {
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
      TINGKATAN_ID,
      JURUSAN_ID, // Opsional
      KELAS_ID,   // Opsional
      DESKRIPSI_A, DESKRIPSI_B, DESKRIPSI_C, DESKRIPSI_D
    } = req.body;

    // 1. Validasi Input Dasar
    if (!KODE_MAPEL || !TAHUN_AJARAN_ID || !TINGKATAN_ID) {
      return res.status(400).json({
        status: "99",
        message: "Field Wajib: KODE_MAPEL, TAHUN_AJARAN_ID, TINGKATAN_ID",
      });
    }

    // =================================================================
    // 🔹 LOGIKA VALIDASI JADWAL (CERDAS)
    // =================================================================
    
    // Kita mulai query dasar ke master_jadwal
    let queryCek = db("master_jadwal")
      .where("KODE_MAPEL", KODE_MAPEL)
      .where("TAHUN_AJARAN_ID", TAHUN_AJARAN_ID);

    // Kondisi 1: Jika KELAS dipilih -> Cek Wajib ada di Kelas itu
    if (KELAS_ID) {
      queryCek.where("KELAS_ID", KELAS_ID);
      
    // Kondisi 2: Jika KELAS tidak dipilih, tapi JURUSAN dipilih -> Cek di Jurusan itu
    } else if (JURUSAN_ID) {
      queryCek.where("JURUSAN_ID", JURUSAN_ID);
      queryCek.where("TINGKATAN_ID", TINGKATAN_ID);
      
    // Kondisi 3: Jika cuma TINGKATAN dipilih -> Cek minimal ada mapel ini di tingkatan tsb
    } else {
      queryCek.where("TINGKATAN_ID", TINGKATAN_ID);
    }

    const jadwalExists = await queryCek.first();

    if (!jadwalExists) {
      let msg = `Mapel ${KODE_MAPEL} tidak ditemukan di Jadwal`;
      
      if (KELAS_ID) msg += ` kelas ${KELAS_ID}.`;
      else if (JURUSAN_ID) msg += ` jurusan ${JURUSAN_ID}.`;
      else msg += ` tingkatan ${TINGKATAN_ID}.`;

      return res.status(400).json({
        status: "99",
        message: `Gagal! ${msg} Mohon cek Master Jadwal.`,
      });
    }

    // =================================================================
    // 🔹 SIMPAN DATA
    // =================================================================

    const result = await PredikatModel.createPredikat({
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      DESKRIPSI_A, DESKRIPSI_B, DESKRIPSI_C, DESKRIPSI_D
    });

    res.status(201).json({
      status: "00",
      message: "Deskripsi Predikat berhasil ditambahkan",
      data: result,
    });

  } catch (err) {
    console.error("❌ Error createPredikat:", err);
    if (err.message.includes("sudah ada")) {
      return res.status(409).json({ status: "99", message: err.message });
    }
    res.status(500).json({ status: "99", message: err.message });
  }
};

/** 🔹 Update Predikat (Validasi Ulang jika target berubah) */
export const updatePredikat = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body;

    // Cek apakah user mengubah parameter target (Mapel, Tahun, Tingkat, Jurusan, Kelas)
    const isTargetChanged = 
        dataUpdate.KODE_MAPEL || 
        dataUpdate.TAHUN_AJARAN_ID || 
        dataUpdate.TINGKATAN_ID ||
        dataUpdate.JURUSAN_ID !== undefined || 
        dataUpdate.KELAS_ID !== undefined;

    if (isTargetChanged) {
        // Ambil data lama untuk fallback (kalau user cuma update sebagian field)
        const oldData = await PredikatModel.getPredikatById(id);
        if(!oldData) return res.status(404).json({status: "99", message: "Data tidak ditemukan"});

        // Tentukan nilai yang akan divalidasi (Baru atau Lama)
        const mapel = dataUpdate.KODE_MAPEL || oldData.mapel.KODE_MAPEL;
        const ta = dataUpdate.TAHUN_AJARAN_ID || oldData.tahun_ajaran.TAHUN_AJARAN_ID;
        const tingkat = dataUpdate.TINGKATAN_ID || oldData.target.TINGKATAN_ID;
        
        // Logic khusus untuk field yang bisa NULL (Jurusan/Kelas)
        const jurusan = (dataUpdate.JURUSAN_ID !== undefined) ? dataUpdate.JURUSAN_ID : oldData.target.JURUSAN_ID;
        const kelas = (dataUpdate.KELAS_ID !== undefined) ? dataUpdate.KELAS_ID : oldData.target.KELAS_ID;

        // --- QUERY VALIDASI ULANG ---
        let queryCek = db("master_jadwal")
            .where("KODE_MAPEL", mapel)
            .where("TAHUN_AJARAN_ID", ta);

        if (kelas) {
            queryCek.where("KELAS_ID", kelas); // Cek spesifik kelas
        } else if (jurusan) {
            queryCek.where("JURUSAN_ID", jurusan); // Cek spesifik jurusan
            queryCek.where("TINGKATAN_ID", tingkat);
        } else {
            queryCek.where("TINGKATAN_ID", tingkat); // Cek umum tingkatan
        }

        const jadwalExists = await queryCek.first();
        if (!jadwalExists) {
            return res.status(400).json({
              status: "99",
              message: `Gagal Update! Mapel tersebut tidak valid di Jadwal sasaran baru.`,
            });
        }
    }

    const updated = await PredikatModel.updatePredikat(id, dataUpdate);
    if (!updated) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });

    res.status(200).json({
      status: "00",
      message: "Deskripsi Predikat berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updatePredikat:", err);
    res.status(500).json({ status: "99", message: err.message });
  }
};

export const deletePredikat = async (req, res) => {
  try {
    const deleted = await PredikatModel.deletePredikat(req.params.id);
    if (!deleted) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "00", message: "Deskripsi Predikat berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
};