// controllers/DashboardGuruController.js

import { getGuruDashboardData } from '../models/dashboardGuruModel.js';

export const getDashboardGuru = async (req, res) => {
    const { id: guruId } = req.params;

    if (!guruId) {
        return res.status(400).json({ message: 'ID Guru tidak valid atau tidak tersedia.' });
    }

    try {
        // 1. Panggil model (sekarang mengembalikan agenda, totalKelas, dan mapelUtama)
        const { agenda: rawAgenda, totalKelas, mapelUtama } = await getGuruDashboardData(guruId);

        // 2. Proses data agenda (logika ini tetap sama)
        const currentTime = new Date().toTimeString().slice(0, 5);
        const agenda = rawAgenda.map(item => {
            let status = 'Belum Dimulai';
            if (currentTime >= item.jamMulai && currentTime <= item.jamSelesai) {
                status = 'Berlangsung';
            } else if (currentTime > item.jamSelesai) {
                status = 'Selesai';
            }
            return {
                id: item.id,
                jam: `${item.jamMulai} - ${item.jamSelesai}`,
                kelas: item.kelas,
                mataPelajaran: item.mataPelajaran,
                status: status
            };
        });

        // --- PERUBAHAN BARU DI SINI ---
        // 3. Buat objek summary dengan logika yang sudah diperbaiki
        const summary = {
            totalKelasDiajar: totalKelas,
            jadwalHariIni: agenda.length,
            // Gunakan `mapelUtama` dari model, tidak lagi bergantung pada `agenda`
            mataPelajaranDiampu: mapelUtama || 'Belum Ditugaskan'
        };

        const attendance = { /* ... data absensi tetap sama ... */ };

        // 4. Kirim respons final
        res.status(200).json({
            summary,
            agenda,
            attendance
        });

    } catch (error) {
        console.error("Dashboard Guru Controller Error:", error);
        res.status(500).json({ message: 'Gagal mengambil data dasbor guru.' });
    }
};