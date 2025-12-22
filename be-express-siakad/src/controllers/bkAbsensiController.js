import { db } from "../core/config/knex.js";
import * as AbsensiModel from "../models/absensiSiswaModel.js";
import * as RiwayatModel from "../models/RiwayatPerubahanAbsenModel.js";

/**
 * 1. Dashboard BK
 * Mengambil statistik harian dan daftar siswa yang butuh perhatian
 */
export const getDashboardBK = async (req, res) => {
    const { id: nipBK } = req.params;

    if (!nipBK || nipBK === 'undefined') {
        return res.status(400).json({ status: "99", message: 'NIP Guru BK tidak valid.' });
    }

    try {
        const guru = await db("master_guru").where("NIP", nipBK).first();
        const { getSiswaPerluPerhatian } = await import('../models/StatistikAbsensiModel.js');
        const daftarPerhatian = await getSiswaPerluPerhatian(3); 

        const summaryGlobal = await db("absensi_siswa")
            .select("STATUS")
            .count("ID as TOTAL")
            .whereRaw("DATE(TANGGAL) = CURDATE()")
            .groupBy("STATUS");

        res.status(200).json({
            status: "00",
            summary: {
                totalSiswaBermasalah: daftarPerhatian.length,
                jumlahKasusAlpa: daftarPerhatian.reduce((acc, curr) => acc + (parseInt(curr.TOTAL_ALPA) || 0), 0),
                statusPetugas: guru ? `Guru BK: ${guru.NAMA}` : "Petugas BK Aktif"
            },
            daftarPerhatian,
            statistikHarian: summaryGlobal
        });

    } catch (error) {
        console.error("Dashboard BK Error:", error);
        res.status(500).json({ status: "99", message: 'Gagal mengambil data dasbor BK.' });
    }
};

/**
 * 2. Update Tindakan BK (PERBAIKAN LOGIKA NIP)
 */
export const updateTindakanBK = async (req, res) => {
    const { absensiId } = req.params;
    const { catatan, statusTangani, statusBaru, alasan, nipBK, kodePelanggaran } = req.body; 

    // nipBK di sini bisa berisi Email atau UserID (267) dari Frontend
    if (!nipBK || nipBK === "undefined" || nipBK === "-") {
        return res.status(400).json({ 
            status: "99", 
            message: "Identitas verifikator tidak ditemukan. Silakan login ulang." 
        });
    }

    const trx = await db.transaction();

    try {
        // --- PROSES LOOKUP NIP (PENTING!) ---
        // Mencari NIP di master_guru berdasarkan NIP, Email, atau ID yang dikirim
        const guru = await trx("master_guru")
            .where("NIP", nipBK)
            .orWhere("email", nipBK) 
            .first();

        if (!guru) {
            throw new Error(`User '${nipBK}' tidak terdaftar sebagai Guru. Pastikan email/NIP sesuai di Master Guru.`);
        }

        const realNIP = guru.NIP; // Gunakan NIP asli dari database

        const dataLama = await trx("absensi_siswa").where("ABSENSI_ID", absensiId).first();
        if (!dataLama) throw new Error(`Data absensi ${absensiId} tidak ditemukan.`);

        // A. LOGIKA PERUBAHAN STATUS
        if (statusBaru && statusBaru !== dataLama.STATUS) {
            await RiwayatModel.simpanLogPerubahan({
                absensiId,
                statusLama: dataLama.STATUS,
                statusBaru: statusBaru,
                alasan: alasan || "Perubahan status oleh Guru BK",
                userId: String(realNIP) 
            }, trx);

            const listBermasalah = ["ALPA", "BOLOS", "MEMBOLOS"];
            const isMasihBermasalah = listBermasalah.includes(statusBaru.toUpperCase()) ? 1 : 0;

            await trx("absensi_siswa")
                .where("ABSENSI_ID", absensiId)
                .update({ 
                    STATUS: statusBaru,
                    PERLU_TINDAKAN: isMasihBermasalah
                });
        }

        // B. UPDATE VERIFIKASI BK
        const dataUpdateBK = {
            CATATAN_BK: catatan || "",
            SUDAH_DITANGGANI: parseInt(statusTangani) === 1 ? 1 : 0,
            VERIFIKASI_BK_ID: realNIP, // <--- SUDAH MENGGUNAKAN NIP ASLI HASIL LOOKUP
            KODE_PELANGGARAN: kodePelanggaran || dataLama.KODE_PELANGGARAN || null,
            TGL_VERIFIKASI_BK: db.fn.now(),
            updated_at: db.fn.now()
        };

        if (parseInt(statusTangani) === 1) {
            dataUpdateBK.PERLU_TINDAKAN = 0;
        }

        await trx("absensi_siswa")
            .where("ABSENSI_ID", absensiId)
            .update(dataUpdateBK);

        await trx.commit();

        // AMBIL DATA TERBARU
        const dataTerbaru = await AbsensiModel.getById(absensiId);

        res.status(200).json({ 
            status: "00", 
            message: "Tindakan bimbingan konseling berhasil disimpan.",
            data: dataTerbaru
        });

    } catch (error) {
        await trx.rollback();
        console.error("Update Tindakan BK Error:", error.message);
        
        let customMessage = error.message;
        if (error.message.includes("foreign key constraint fails")) {
            customMessage = `Gagal simpan: NIP tidak valid di sistem Master Guru.`;
        }

        res.status(500).json({ 
            status: "99", 
            message: customMessage 
        });
    }
};