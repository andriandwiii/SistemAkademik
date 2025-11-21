import * as TransaksiKkmModel from "../models/transaksiKkmModel.js"; 

/* ===========================================================
 * GET ALL TRANSAKSI KKM
 * ===========================================================
 */
export const getAllTransaksiKkm = async (req, res) => {
  try {
    const data = await TransaksiKkmModel.getAllTransaksiKkm();

    res.status(200).json({
      status: "00",
      message: "Data transaksi KKM berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error getAllTransaksiKkm:", err);
    res.status(500).json({ status: "99", message: "Terjadi kesalahan server saat mengambil data." });
  }
};

/* ===========================================================
 * CREATE TRANSAKSI KKM (FULL VALIDATION)
 * ===========================================================
 */
export const createTransaksiKkm = async (req, res) => {
  try {
    // 1. Ambil semua field dari body (Pastikan KODE_KKM diambil)
    const { TINGKATAN_ID, JURUSAN_ID, KELAS_ID, KODE_MAPEL, TAHUN_AJARAN_ID, KODE_KKM } = req.body;

    // 2. Validasi Input Wajib
    if (!TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !KODE_MAPEL || !TAHUN_AJARAN_ID || !KODE_KKM) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi (Tingkat, Jurusan, Kelas, Mapel, Tahun Ajaran, dan Data KKM).",
      });
    }

    // 3. Cek Master KKM berdasarkan Mapel
    // Kita perlu tahu KKM apa yang seharusnya dimiliki oleh Mapel ini
    const dataMasterKkm = await TransaksiKkmModel.findKkmByKodeMapel(KODE_MAPEL);

    if (!dataMasterKkm) {
      return res.status(400).json({
        status: "99",
        message: `Mapel ${KODE_MAPEL} belum di-setting di Master KKM. Silakan atur Master KKM terlebih dahulu.`,
      });
    }

    // 4. Validasi Konsistensi (Business Logic)
    // Pastikan KODE_KKM yang dikirim user BENAR-BENAR milik Mapel tersebut.
    // Ini mencegah user mengirim Mapel Matematika tapi menggunakan Nilai KKM Olahraga.
    if (dataMasterKkm.KODE_KKM !== KODE_KKM) {
        return res.status(400).json({
            status: "99",
            message: `Data tidak valid. Kode KKM ${KODE_KKM} bukan pasangan untuk Mapel ${KODE_MAPEL}. Seharusnya: ${dataMasterKkm.KODE_KKM}`,
        });
    }

    // 5. Simpan Transaksi
    const result = await TransaksiKkmModel.createTransaksiKkm({
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
      KODE_KKM, 
    });

    res.status(201).json({
      status: "00",
      message: "Transaksi KKM berhasil ditambahkan",
      data: result,
    });

  } catch (err) {
    console.error("❌ Error createTransaksiKkm:", err);

    // Handle Error Duplikasi (Jika kombinasi Kelas+Mapel+Tahun sudah ada)
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Gagal Simpan: Data KKM untuk kombinasi Kelas & Mapel ini SUDAH ADA.",
      });
    }

    // Handle Error Foreign Key (Jika ID Tingkat/Jurusan/Kelas tidak valid)
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          status: "99",
          message: "Data Referensi Salah: Tingkatan, Jurusan, Kelas, atau Tahun Ajaran tidak ditemukan di database.",
        });
    }

    res.status(500).json({ status: "99", message: "Gagal menyimpan data ke database." });
  }
};

/* ===========================================================
 * UPDATE TRANSAKSI KKM (FULL VALIDATION)
 * ===========================================================
 */
export const updateTransaksiKkm = async (req, res) => {
  try {
    const { id } = req.params;
    const { TINGKATAN_ID, JURUSAN_ID, KELAS_ID, KODE_MAPEL, TAHUN_AJARAN_ID, KODE_KKM } = req.body;

    // 1. Validasi Input Wajib
    if (!TINGKATAN_ID || !JURUSAN_ID || !KELAS_ID || !KODE_MAPEL || !TAHUN_AJARAN_ID || !KODE_KKM) {
      return res.status(400).json({
        status: "99",
        message: "Semua field wajib diisi.",
      });
    }

    // 2. Cek Master KKM
    const dataMasterKkm = await TransaksiKkmModel.findKkmByKodeMapel(KODE_MAPEL);

    if (!dataMasterKkm) {
      return res.status(400).json({
        status: "99",
        message: `Mapel ${KODE_MAPEL} belum di-setting di Master KKM.`,
      });
    }

    // 3. Validasi Konsistensi Mapel vs KKM
    if (dataMasterKkm.KODE_KKM !== KODE_KKM) {
        return res.status(400).json({
            status: "99",
            message: `Data tidak valid. KKM ${KODE_KKM} bukan milik Mapel ${KODE_MAPEL}.`,
        });
    }

    // 4. Lakukan Update
    const updated = await TransaksiKkmModel.updateTransaksiKkm(id, {
      TINGKATAN_ID,
      JURUSAN_ID,
      KELAS_ID,
      KODE_MAPEL,
      TAHUN_AJARAN_ID,
      KODE_KKM,
    });

    if (!updated) {
      return res.status(404).json({
        status: "99",
        message: "Data Transaksi KKM tidak ditemukan (ID tidak valid).",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi KKM berhasil diperbarui",
      data: updated,
    });

  } catch (err) {
    console.error("❌ Error updateTransaksiKkm:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "99",
        message: "Gagal Update: Kombinasi Kelas & Mapel ini sudah digunakan.",
      });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          status: "99",
          message: "Data Referensi Salah: Tingkatan/Jurusan/Kelas/Tahun tidak valid.",
        });
    }

    res.status(500).json({ status: "99", message: "Gagal memperbarui data." });
  }
};

/* ===========================================================
 * DELETE TRANSAKSI KKM
 * ===========================================================
 */
export const deleteTransaksiKkm = async (req, res) => {
  try {
    const deleted = await TransaksiKkmModel.deleteTransaksiKkm(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "99",
        message: "Transaksi KKM tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "00",
      message: "Transaksi KKM berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ Error deleteTransaksiKkm:", err);
    
    // Cek constraint foreign key (misal data ini sudah dipakai di tabel nilai siswa)
    if (err.code === "ER_ROW_IS_REFERENCED_2") { 
        return res.status(400).json({
            status: "99",
            message: "Gagal Hapus: Data ini sedang digunakan di tabel lain (misal: Penilaian Siswa).",
        });
    }

    res.status(500).json({ status: "99", message: err.message });
  }
};