import * as AbsensiModel from "../models/absensiSiswaModel.js";
import { db } from "../core/config/knex.js";

/**
 * 1. Ambil Monitoring untuk TU
 * Menampilkan daftar absensi berdasarkan filter kelas dan tanggal
 */
export async function getMonitoringAbsen(req, res) {
    try {
        let { kelasId, tanggal } = req.query;
        // Default ke tanggal hari ini jika tidak ada input
        if (!tanggal || tanggal === 'undefined') {
            tanggal = new Date().toISOString().split('T')[0];
        }
        
        const data = await AbsensiModel.getAbsensiByKelasAndTanggal(kelasId, tanggal);
        res.json({ status: "00", data });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
}

/**
 * 2. Input Masal oleh TU/Piket
 * Menangani penyimpanan absensi satu kelas sekaligus
 */
export async function inputAbsenMasal(req, res) {
    const { tanggal, kelasId, tingkatanId, dataAbsen, inputOlehId } = req.body;
    const trx = await db.transaction();

    try {
        // Ambil Tahun Ajaran Aktif
        const taAktif = await trx("master_tahun_ajaran").where("STATUS", "Aktif").first();
        if (!taAktif) throw new Error("Tidak ada Tahun Ajaran yang aktif.");

        // Generate ID Absensi secara berurutan
        const last = await trx("absensi_siswa").orderBy("ID", "desc").first();
        let nextNum = last ? parseInt(last.ABSENSI_ID.replace("ABS", "")) + 1 : 1;

        const finalData = [];
        for (let i = 0; i < dataAbsen.length; i++) {
            const item = dataAbsen[i];
            
            // Cari data transaksi siswa (pastikan siswa ada di kelas tersebut)
            const trxSiswa = await trx("transaksi_siswa_kelas")
                .where({ 
                    NIS: item.NIS, 
                    KELAS_ID: kelasId, 
                    TAHUN_AJARAN_ID: taAktif.TAHUN_AJARAN_ID 
                })
                .first();
            
            if (!trxSiswa) throw new Error(`Siswa NIS ${item.NIS} tidak ditemukan di kelas ${kelasId}`);

            finalData.push({
                ABSENSI_ID: `ABS${(nextNum + i).toString().padStart(6, "0")}`,
                NIS: item.NIS,
                TRANSAKSI_ID: trxSiswa.TRANSAKSI_ID,
                TAHUN_AJARAN_ID: taAktif.TAHUN_AJARAN_ID,
                TINGKATAN_ID: tingkatanId,
                KELAS_ID: kelasId,
                TANGGAL: tanggal,
                STATUS: item.STATUS,
                // Beri tanda jika perlu tindakan BK (Alpa/Membolos)
                PERLU_TINDAKAN: ["ALPA", "BOLOS", "MEMBOLOS"].includes(item.STATUS.toUpperCase()) ? 1 : 0,
                INPUT_OLEH_ID: inputOlehId,
                created_at: new Date()
            });
        }

        await AbsensiModel.bulkInsertAbsensi(finalData, trx);
        await trx.commit();
        
        res.json({ status: "00", message: "Absensi berhasil disimpan" });
    } catch (error) {
        await trx.rollback();
        res.status(500).json({ status: "99", message: error.message });
    }
}

/**
 * 3. Update Data Absensi (Khusus TU)
 * Digunakan untuk memperbaiki kesalahan input status, tanggal, atau kelas
 */
export async function updateAbsensi(req, res) {
    try {
        const id = req.params.id;
        const { STATUS, TANGGAL, KELAS_ID } = req.body;

        const existing = await AbsensiModel.getById(id);
        if (!existing) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });

        // Update data dasar
        await AbsensiModel.updateTU(id, { STATUS, TANGGAL, KELAS_ID });

        // Jika status berubah jadi normal (HADIR/IZIN), matikan flag perlu tindakan BK
        if (!["ALPA", "BOLOS", "MEMBOLOS"].includes(STATUS.toUpperCase())) {
            await db("absensi_siswa").where("ABSENSI_ID", id).update({ PERLU_TINDAKAN: 0 });
        } else {
            // Jika berubah kembali ke Alpa, aktifkan kembali flag BK
            await db("absensi_siswa").where("ABSENSI_ID", id).update({ PERLU_TINDAKAN: 1 });
        }

        // Ambil data terbaru untuk dikirim balik ke UI
        const dataTerbaru = await AbsensiModel.getById(id);
        res.json({ status: "00", message: "Data berhasil diperbarui", data: dataTerbaru });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
}

/**
 * 4. Hapus Absensi
 */
export async function deleteAbsensi(req, res) {
    try {
        const id = req.params.id;
        const existing = await AbsensiModel.getById(id);
        if (!existing) return res.status(404).json({ status: "99", message: "Data tidak ditemukan" });
        
        await AbsensiModel.remove(id);
        res.json({ status: "00", message: "Data berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
}

/**
 * 5. Riwayat Individual Siswa
 */
export async function getHistorySiswa(req, res) {
    try {
        const { nis } = req.params;
        const data = await AbsensiModel.getRiwayatSiswaIndividual(nis);
        res.json({ status: "00", data });
    } catch (error) {
        res.status(500).json({ status: "99", message: error.message });
    }
}

/**
 * 6. Rekap Absensi Bulanan (UNTUK DASHBOARD)
 * Menampilkan akumulasi status absensi siswa khusus bulan berjalan
 */
export async function getRekapAbsenSiswa(req, res) {
    try {
        const { nis } = req.params;
        
        const now = new Date();
        const bulanSekarang = now.getMonth() + 1; 
        const tahunSekarang = now.getFullYear();

        const rekapData = await db("absensi_siswa")
            .where("NIS", nis)
            .whereRaw('MONTH(TANGGAL) = ?', [bulanSekarang])
            .whereRaw('YEAR(TANGGAL) = ?', [tahunSekarang])
            .select("STATUS")
            .count("STATUS as total")
            .groupBy("STATUS");

        const hasil = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
        
        rekapData.forEach(item => {
            const status = item.STATUS.toUpperCase();
            if (status === 'HADIR') {
                hasil.HADIR = parseInt(item.total);
            } else if (status === 'SAKIT') {
                hasil.SAKIT = parseInt(item.total);
            } else if (status === 'IZIN') {
                hasil.IZIN = parseInt(item.total);
            } else if (['ALPA', 'BOLOS', 'MEMBOLOS'].includes(status)) {
                hasil.ALPA += parseInt(item.total);
            }
        });

        res.json({ 
            status: "00", 
            data: hasil,
            periode: `Bulan ${bulanSekarang}-${tahunSekarang}`
        });
    } catch (error) {
        res.status(500).json({ status: "99", message: error.message });
    }
}