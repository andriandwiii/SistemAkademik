import { db } from "../core/config/knex.js";

/**
 * 1. Ringkasan per siswa 
 * Digunakan untuk melihat histori satu siswa tertentu
 */
export const getSummaryAbsensiSiswa = async (nis, taId) => {
    const results = await db("absensi_siswa")
        .select("STATUS")
        .count("ID as TOTAL")
        .where({ NIS: nis, TAHUN_AJARAN_ID: taId })
        .groupBy("STATUS");

    const summary = { HADIR: 0, ALPA: 0, IZIN: 0, SAKIT: 0, MEMBOLOS: 0 };
    results.forEach(row => {
        summary[row.STATUS] = parseInt(row.TOTAL);
    });
    return summary;
};

/**
 * 2. Detail Ketidakhadiran Harian (BARU)
 * Menampilkan siapa saja yang tidak hadir (Alpa, Izin, Sakit, Bolos) pada tanggal terpilih
 */
export const getDetailAbsensiHarian = async (tanggal) => {
    return await db("absensi_siswa as a")
        .select(
            "a.NIS",
            "s.NAMA",
            "a.KELAS_ID", // Karena tabel master_kelas Anda hanya berisi ID
            "a.STATUS"
        )
        .join("master_siswa as s", "a.NIS", "s.NIS")
        .whereRaw("DATE(a.TANGGAL) = ?", [tanggal])
        .whereNot("a.STATUS", "HADIR") // Hanya ambil yang tidak masuk
        .orderBy("a.STATUS", "asc");
};

/**
 * 3. Statistik harian untuk Chart
 * Menghitung jumlah total per status (Hadir, Alpa, dll) untuk grafik doughnut
 */
export const getStatistikHarianKelas = async (tanggal) => {
    return await db("absensi_siswa")
        .select("STATUS")
        .count("ID as TOTAL")
        .whereRaw("DATE(TANGGAL) = ?", [tanggal])
        .groupBy("STATUS");
};

/**
 * 4. Daftar perhatian BK (Opsional)
 * Tetap dipertahankan jika Anda masih ingin fitur "Siswa paling sering bolos"
 */
export const getSiswaPerluPerhatian = async (limitBolos = 3) => {
    return await db("absensi_siswa as a")
        .select(
            "a.NIS",
            "s.NAMA",
            "k.KELAS_ID as NAMA_KELAS",
            db.raw("COUNT(CASE WHEN a.STATUS = 'ALPA' THEN 1 END) as TOTAL_ALPA"),
            db.raw("COUNT(CASE WHEN a.STATUS = 'MEMBOLOS' THEN 1 END) as TOTAL_BOLOS")
        )
        .join("master_siswa as s", "a.NIS", "s.NIS")
        .leftJoin("master_kelas as k", "a.KELAS_ID", "k.KELAS_ID")
        .where("a.SUDAH_DITANGGANI", false)
        .groupBy("a.NIS", "s.NAMA", "k.KELAS_ID")
        .having(db.raw("COUNT(CASE WHEN a.STATUS = 'ALPA' THEN 1 END) + COUNT(CASE WHEN a.STATUS = 'MEMBOLOS' THEN 1 END)"), ">", limitBolos)
        .orderBy("TOTAL_ALPA", "desc");
};