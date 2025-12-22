import { db } from "../core/config/knex.js";

export const getStatsDashboardTU = async () => {
    try {
        // Menggunakan format YYYY-MM-DD yang sesuai dengan kolom TANGGAL di DB kamu
        const hariIni = new Date().toISOString().split('T')[0];
        const namaHari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());

        // 1. Total Siswa Aktif
        const totalSiswa = await db("master_siswa")
            .where("STATUS", "Aktif")
            .count("SISWA_ID as total")
            .first();

        // 2. Statistik Absensi Siswa Hari Ini
        const statsSiswa = await db("absensi_siswa")
            .select("STATUS")
            .count("ID as total")
            .whereRaw("DATE(TANGGAL) = ?", [hariIni])
            .groupBy("STATUS");

        // 3. Statistik Absensi Guru Hari Ini
        const statsGuru = await db("absensi_guru")
            .select("STATUS")
            .count("ID as total")
            .whereRaw("DATE(TANGGAL) = ?", [hariIni])
            .groupBy("STATUS");

        // 4. Agenda Mengajar (Versi Aman)
        let agenda = [];
        try {
            agenda = await db("master_jadwal as j")
                .join("master_guru as g", "j.NIP", "g.NIP")
                .leftJoin("master_mata_pelajaran as mp", "j.KODE_MAPEL", "mp.KODE_MAPEL")
                .select(
                    "g.NAMA as guru",
                    "j.KELAS_ID as kelas",
                    "mp.NAMA_MAPEL as mapel",
                    "j.KODE_JP as waktu"
                )
                .where("j.HARI", namaHari)
                .orderBy("j.KODE_JP", "asc");
        } catch (errAgenda) {
            console.error("Gagal ambil agenda:", errAgenda.message);
        }

        // 5. Kalkulasi Summary dengan Normalisasi Huruf (Case-Insensitive)
        // Kita ubah semua ke UpperCase agar 'Hadir' atau 'HADIR' tetap terbaca
        const getCountByStatus = (statsArray, statusName) => {
            const found = statsArray.find(item => 
                item.STATUS && item.STATUS.toUpperCase() === statusName.toUpperCase()
            );
            return found ? parseInt(found.total) : 0;
        };

        const jmlHadirSiswa = getCountByStatus(statsSiswa, 'HADIR');
        const jmlHadirGuru = getCountByStatus(statsGuru, 'HADIR');
        
        const totalSiswaCount = totalSiswa?.total || 0;
        const persenSiswa = totalSiswaCount > 0 
            ? ((jmlHadirSiswa / totalSiswaCount) * 100).toFixed(1) 
            : "0";

        return {
            summary: {
                persenHadirSiswa: persenSiswa + "%",
                totalAgenda: agenda.length,
                totalGuruHadir: jmlHadirGuru
            },
            chartData: {
                // Menampilkan label asli dari DB (Hadir, Sakit, dll)
                labels: statsSiswa.length > 0 ? statsSiswa.map(s => s.STATUS) : ["Belum Ada Data"],
                datasets: statsSiswa.length > 0 ? statsSiswa.map(s => parseInt(s.total)) : [0]
            },
            tabelAgenda: agenda
        };
    } catch (error) {
        console.error("Error fatal pada DashboardTUModel:", error);
        throw error;
    }
};