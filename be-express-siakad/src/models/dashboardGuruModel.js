// models/DashboardGuruModel.js

import { db } from '../core/config/knex.js'; // Sesuaikan path ke konfigurasi Knex Anda

export const getGuruDashboardData = async (guruId) => {
    try {
        // 1. Dapatkan data hari ini dari database (logika ini tetap sama)
        const dayIndex = new Date().getDay();
        const urutanDb = dayIndex === 0 ? 7 : dayIndex;
        const hariIni = await db('master_hari').where('URUTAN', urutanDb).first();

        let agendaResult = [];
        if (hariIni) {
            // 2. Query untuk mengambil jadwal mengajar (hanya jika ada data hari)
            agendaResult = await db('t_mapel_kelas')
                .join('m_kelas', 't_mapel_kelas.KELAS_ID', '=', 'm_kelas.KELAS_ID')
                .join('master_mata_pelajaran', 't_mapel_kelas.MAPEL_ID', '=', 'master_mata_pelajaran.MAPEL_ID')
                .join('t_jadwal', 't_mapel_kelas.MAPEL_KELAS_ID', '=', 't_jadwal.MAPEL_KELAS_ID')
                .select(
                    't_jadwal.JADWAL_ID as id',
                    db.raw("DATE_FORMAT(t_jadwal.JAM_MULAI, '%H:%i') as jamMulai"),
                    db.raw("DATE_FORMAT(t_jadwal.JAM_SELESAI, '%H:%i') as jamSelesai"),
                    'm_kelas.NAMA_KELAS as kelas',
                    'master_mata_pelajaran.NAMA_MAPEL as mataPelajaran'
                )
                .where('t_mapel_kelas.GURU_ID', guruId)
                .andWhere('t_jadwal.HARI_ID', hariIni.HARI_ID)
                .orderBy('t_jadwal.JAM_MULAI', 'asc');
        }

        // 3. Query untuk menghitung total kelas yang diajar (logika ini tetap sama)
        const totalKelasResult = await db('t_mapel_kelas')
            .where('GURU_ID', guruId)
            .countDistinct('KELAS_ID as totalKelas')
            .first();

        // --- PERUBAHAN BARU DI SINI ---
        // 4. Query untuk mencari mata pelajaran utama yang diampu, terlepas dari jadwal
        const mapelUtamaResult = await db('t_mapel_kelas')
            .join('master_mata_pelajaran', 't_mapel_kelas.MAPEL_ID', '=', 'master_mata_pelajaran.MAPEL_ID')
            .select('master_mata_pelajaran.NAMA_MAPEL')
            .where('t_mapel_kelas.GURU_ID', guruId)
            .first(); // Ambil mapel pertama yang ditemukan untuk guru ini

        // Mengembalikan semua data yang dibutuhkan controller
        return {
            agenda: agendaResult,
            totalKelas: totalKelasResult.totalKelas || 0,
            // Kirim nama mapel utama atau null jika tidak ada
            mapelUtama: mapelUtamaResult ? mapelUtamaResult.NAMA_MAPEL : null,
        };
    } catch (error) {
        console.error('Error in DashboardGuruModel:', error);
        throw new Error('Gagal mengambil data dasbor dari database.');
    }
};