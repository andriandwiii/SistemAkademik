import * as AbsensiModel from "../models/AbsensiGuruModel.js"; // Import Model
import fs from "fs";
import path from "path";

/* ===========================================================
 * 0. LIST GURU (Untuk Dropdown Frontend)
 * =========================================================== */
export const getListGuru = async (req, res) => {
    try {
        const rows = await AbsensiModel.getListGuru();
        res.json({ status: "success", data: rows });
    } catch (error) {
        console.error("Error getListGuru:", error);
        res.status(500).json({ status: "error", message: "Gagal memuat data guru" });
    }
};

/* ===========================================================
 * 1. CEK STATUS ABSENSI HARI INI
 * =========================================================== */
export const cekStatusHarian = async (req, res) => {
    const { nip } = req.query;
    const today = new Date().toISOString().split('T')[0];

    if (!nip) return res.status(400).json({ message: "NIP diperlukan" });

    try {
        // Panggil Model
        const data = await AbsensiModel.getAbsensiByNipDate(nip, today);

        // Logika Response Frontend
        if (!data) {
            return res.json({ status: "success", step: "BELUM_ABSEN", data: null });
        }
        if (data.STATUS === 'Hadir' && !data.JAM_KELUAR) {
            return res.json({ status: "success", step: "SUDAH_MASUK", data: data });
        }
        return res.json({ status: "success", step: "SELESAI", data: data });

    } catch (error) {
        console.error("Error Cek Status:", error);
        return res.status(500).json({ status: "error", message: "Database Error" });
    }
};

/* ===========================================================
 * 2. ABSEN MASUK (POST)
 * =========================================================== */
export const absenMasuk = async (req, res) => {
    const { NIP, STATUS, KETERANGAN, LATITUDE, LONGITUDE, TANDA_TANGAN_MASUK } = req.body;
    
    // 1. Validasi Input Dasar
    if (!NIP || !STATUS) {
        return res.status(400).json({ status: "error", message: "NIP dan Status wajib diisi!" });
    }

    // 2. Handle Foto Upload
    let fotoPath = null;
    if (req.file) {
        fotoPath = `/uploads/absensi/${req.file.filename}`; 
    } else if (STATUS === 'Hadir') {
        return res.status(400).json({ status: "error", message: "Foto wajib diupload untuk kehadiran!" });
    }

    // 3. Persiapan Data
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const jamMasuk = now.toTimeString().split(' ')[0]; // Format HH:mm:ss
    
    // Cek Terlambat (Contoh: > 07:00)
    const batasJam = "07:00:00";
    const isTerlambat = (jamMasuk > batasJam && STATUS === 'Hadir') ? 1 : 0;
    
    // Format lokasi jadi string (lat, long)
    const lokasiMasuk = (LATITUDE && LONGITUDE) ? `${LATITUDE}, ${LONGITUDE}` : null;

    try {
        // 4. Cek Duplikat via Model
        const existing = await AbsensiModel.getAbsensiByNipDate(NIP, today);
        
        if (existing) {
            // Hapus foto jika gagal (sudah absen)
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ status: "error", message: "Anda sudah absen hari ini!" });
        }

        // 5. Simpan via Model (Model akan handle generate KODE AGxxxxx)
        await AbsensiModel.createAbsenMasuk({
            NIP,
            TANGGAL: today,
            STATUS,
            JAM_MASUK: STATUS === 'Hadir' ? jamMasuk : null,
            LOKASI_MASUK: lokasiMasuk,
            FOTO_MASUK: fotoPath,
            TANDA_TANGAN_MASUK: TANDA_TANGAN_MASUK || null,
            KETERANGAN: KETERANGAN || "-",
            TERLAMBAT: isTerlambat
        });

        return res.json({ status: "success", message: "Berhasil menyimpan absensi" });

    } catch (error) {
        console.error("Error Absen Masuk:", error);
        // Bersihkan file jika error insert DB
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        // Cek error duplicate entry (untuk safety tambahan)
        if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('Duplicate'))) {
             return res.status(400).json({ status: "error", message: "Anda sudah absen hari ini!" });
        }

        return res.status(500).json({ status: "error", message: "Gagal menyimpan data absensi" });
    }
};

/* ===========================================================
 * 3. ABSEN PULANG (POST)
 * =========================================================== */
export const absenPulang = async (req, res) => {
    const { NIP, LATITUDE, LONGITUDE, TANDA_TANGAN_KELUAR } = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    const jamPulang = new Date().toTimeString().split(' ')[0];
    const lokasiKeluar = (LATITUDE && LONGITUDE) ? `${LATITUDE}, ${LONGITUDE}` : null;

    try {
        // Cek dulu datanya
        const existing = await AbsensiModel.getAbsensiByNipDate(NIP, today);

        if (!existing) {
            return res.status(400).json({ status: "error", message: "Anda belum absen masuk hari ini!" });
        }

        if (existing.JAM_KELUAR) {
            return res.status(400).json({ status: "error", message: "Anda sudah absen pulang sebelumnya!" });
        }

        // Update via Model
        await AbsensiModel.updateAbsenPulang(NIP, today, {
            JAM_KELUAR: jamPulang,
            LOKASI_KELUAR: lokasiKeluar,
            TANDA_TANGAN_KELUAR: TANDA_TANGAN_KELUAR
        });

        return res.json({ status: "success", message: "Berhasil absen pulang" });

    } catch (error) {
        console.error("Error Absen Pulang:", error);
        return res.status(500).json({ status: "error", message: "Gagal absen pulang" });
    }
};

/* ===========================================================
 * 4. RIWAYAT SAYA (GET)
 * =========================================================== */
export const getRiwayatSaya = async (req, res) => {
    const { nip } = req.query;
    try {
        const data = await AbsensiModel.getRiwayatAbsensiByNip(nip);
        res.json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ===========================================================
 * 5. REKAP ADMIN (GET)
 * =========================================================== */
export const getRekapAbsensiAdmin = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const data = await AbsensiModel.getAllAbsensiWithGuru({ startDate, endDate });
        res.json({ status: "success", data });
    } catch (error) {
        console.error("Error Rekap Admin:", error);
        res.status(500).json({ message: "Gagal mengambil data rekap." });
    }
};

/* ===========================================================
 * 6. HAPUS DATA (DELETE)
 * =========================================================== */
export const deleteAbsensi = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Ambil data dulu lewat Model (untuk dapat nama file foto)
        const data = await AbsensiModel.getAbsensiById(id);
        
        if (!data) {
            return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });
        }

        // 2. Hapus dari Database via Model
        await AbsensiModel.deleteAbsensi(id);

        // 3. Hapus File Fisik (Cleanup)
        if (data.FOTO_MASUK) {
            // Asumsi: Path di DB diawali dengan '/uploads/...', 
            // Kita perlu hapus slash depan jika menggunakan path.join dengan process.cwd()
            // atau pastikan path folder public sudah benar
            const filePath = path.join(process.cwd(), "public", data.FOTO_MASUK); 
            
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error("Gagal hapus file fisik:", err);
                    // Tidak perlu throw error, karena data DB sudah terhapus
                }
            }
        }

        res.json({ status: "success", message: "Data absensi berhasil dihapus" });

    } catch (error) {
        console.error("Error Delete:", error);
        res.status(500).json({ message: "Gagal menghapus data" });
    }
};