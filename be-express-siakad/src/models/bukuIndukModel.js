import { db } from "../core/config/knex.js";

// ============================================================
// BIODATA & KELAS SISWA
// ============================================================

// 1. Ambil Biodata Siswa dari Master
export const getBiodataSiswa = async (NIS) => {
  const result = await db("master_siswa")
    .where("NIS", NIS)
    .select(
      '*',
      db.raw('TGL_LAHIR as TANGGAL_LAHIR'),
      db.raw('GENDER as JENIS_KELAMIN')
    )
    .first();
  
  return result;
};

// 2. Ambil Kelas Aktif Siswa (Siswa bisa pindah kelas tiap tahun)
export const getKelasSiswa = async (NIS, TAHUN_ID) => {
  return await db("transaksi_siswa_kelas")
    .where({ NIS: NIS, TAHUN_AJARAN_ID: TAHUN_ID })
    .select("KELAS_ID", "TINGKATAN_ID", "JURUSAN_ID")
    .first();
};

// ============================================================
// NILAI & PREDIKAT
// ============================================================

// 3. Ambil Nilai & Predikat (dengan deskripsi berdasarkan nilai)
export const getNilaiLengkap = async (NIS, TAHUN_ID, SEMESTER) => {
  const nilaiSiswa = await db("transaksi_nilai as tn")
    .join("master_mata_pelajaran as m", "tn.KODE_MAPEL", "m.KODE_MAPEL")
    .leftJoin("master_predikat as p", function() {
      this.on("p.KODE_MAPEL", "=", "m.KODE_MAPEL")
          .andOn("p.TAHUN_AJARAN_ID", "=", "tn.TAHUN_AJARAN_ID");
    })
    .select(
      "m.ID as MAPEL_ID_ASLI",
      "m.KODE_MAPEL",
      "m.NAMA_MAPEL",
      "m.KATEGORI",
      "tn.NILAI_P",
      "tn.NILAI_K",
      db.raw("ROUND((tn.NILAI_P + tn.NILAI_K) / 2) as RATA_RATA"),
      "p.DESKRIPSI_A",
      "p.DESKRIPSI_B",
      "p.DESKRIPSI_C",
      "p.DESKRIPSI_D"
    )
    .where({ "tn.NIS": NIS, "tn.TAHUN_AJARAN_ID": TAHUN_ID, "tn.SEMESTER": SEMESTER });

  const gabungMapel = await db("transaksi_gabung_mapel").select("MAPEL_INDUK_ID", "MAPEL_KOMPONEN_ID");

  return { nilaiSiswa, gabungMapel };
};

// Fungsi helper untuk menentukan predikat berdasarkan nilai
export const getPredikatByNilai = (nilai) => {
  if (nilai >= 90) return "A";
  if (nilai >= 80) return "B";
  if (nilai >= 70) return "C";
  return "D";
};

// Fungsi helper untuk generate deskripsi berdasarkan template predikat
export const generateDeskripsi = (predikat, template, namaMapel) => {
  if (!template) {
    const defaultDescriptions = {
      A: `Menunjukkan penguasaan yang sangat baik dalam ${namaMapel}, mampu menguasai seluruh kompetensi dengan sangat memuaskan.`,
      B: `Menunjukkan penguasaan yang baik dalam ${namaMapel}, mampu menguasai kompetensi dasar dengan memuaskan.`,
      C: `Menunjukkan penguasaan yang cukup dalam ${namaMapel}, perlu meningkatkan pemahaman pada beberapa kompetensi.`,
      D: `Perlu bimbingan lebih lanjut dalam ${namaMapel} untuk meningkatkan penguasaan kompetensi dasar.`
    };
    return defaultDescriptions[predikat] || defaultDescriptions.D;
  }

  return template.replace(/{materi}/g, namaMapel).replace(/{nama}/g, "Siswa");
};

// ============================================================
// WALI KELAS & KEPALA SEKOLAH
// ============================================================

// 4. Ambil Wali Kelas berdasarkan KELAS_ID
export const getWaliKelas = async (KELAS_ID) => {
  return await db("transaksi_guru_wakel as wk")
    .join("master_guru as g", "wk.NIP", "g.NIP")
    .select("g.NAMA", "g.NIP")
    .where("wk.KELAS_ID", KELAS_ID)
    .first();
};

// 5. Ambil Kepala Sekolah berdasarkan KODE_JABATAN
export const getKepalaSekolah = async () => {
  return await db("master_guru as g")
    .join("master_jabatan as j", "g.KODE_JABATAN", "j.KODE_JABATAN")
    .where("j.NAMA_JABATAN", "Kepala Sekolah")
    .andWhere("g.STATUS_KEPEGAWAIAN", "Aktif")
    .select("g.NAMA", "g.NIP")
    .first();
};

// ============================================================
// KEHADIRAN & REFERENSI
// ============================================================

// 6. Ambil Data Kehadiran
export const getKehadiranSiswa = async (NIS, TAHUN_ID, SEMESTER) => {
  return await db("transaksi_kehadiran")
    .where({ NIS, TAHUN_AJARAN_ID: TAHUN_ID, SEMESTER })
    .first();
};

// 7. Ambil Referensi Tanggal Cetak Raport
export const getReferensiCetak = async (SEMESTER_KE) => {
  return await db("referensi_tanggal_rapor").where("SEMESTER_KE", SEMESTER_KE).first();
};

// ============================================================
// USER & PROFILE
// ============================================================

// 8. Fungsi untuk mendapatkan profil user
export const getUserProfile = async (userId) => {
    const user = await db("users")
        .where({ id: userId })
        .select("id", "name", "email", "role")
        .first();

    if (!user) return null;

    if (user.role === "GURU") {
        const guruData = await db("master_guru")
            .where("EMAIL", user.email)
            .select("GURU_ID", "NIP", "NAMA", "KODE_JABATAN")
            .first();

        return { ...user, guru: guruData };
    }

    return user;
};

// ============================================================
// WALI KELAS - VALIDASI & DATA
// ============================================================

// 9. Fungsi untuk cek apakah guru adalah wali kelas di kelas tertentu
export const checkGuruIsWaliKelas = async (nip, kelasId) => {
    const result = await db("transaksi_guru_wakel")
        .where({ 
            NIP: nip, 
            KELAS_ID: kelasId 
        })
        .first();

    return !!result;
};

// 10. Fungsi untuk mendapatkan kelas yang diampu sebagai wali kelas
export const getKelasWaliByGuru = async (NIP) => {
    const result = await db("transaksi_guru_wakel as tw")
        .leftJoin("master_kelas as mk", "tw.KELAS_ID", "mk.KELAS_ID")
        .leftJoin("master_ruang as mr", "mk.RUANG_ID", "mr.RUANG_ID")
        .leftJoin("master_tingkatan as mt", "tw.TINGKATAN_ID", "mt.TINGKATAN_ID")
        .leftJoin("master_jurusan as mj", "tw.JURUSAN_ID", "mj.JURUSAN_ID")
        .where("tw.NIP", NIP)
        .select(
            "tw.KELAS_ID",
            "mr.NAMA_RUANG",
            "mt.TINGKATAN_ID",
            "mt.TINGKATAN",
            "mj.JURUSAN_ID",
            "mj.NAMA_JURUSAN"
        )
        .first();

    return result;
};

// 11. Fungsi untuk mendapatkan daftar siswa berdasarkan kelas wali
export const getSiswaByKelasWali = async (nip, tahunAjaranId) => {
    const rows = await db("transaksi_guru_wakel as tw")
        .join("transaksi_siswa_kelas as ts", function() {
            this.on("tw.KELAS_ID", "=", "ts.KELAS_ID")
                .andOn("tw.TINGKATAN_ID", "=", "ts.TINGKATAN_ID")
                .andOn("tw.JURUSAN_ID", "=", "ts.JURUSAN_ID");
        })
        .join("master_siswa as ms", "ts.NIS", "ms.NIS")
        .leftJoin("master_kelas as mk", "tw.KELAS_ID", "mk.KELAS_ID")
        .leftJoin("master_ruang as mr", "mk.RUANG_ID", "mr.RUANG_ID")
        .where({
            "tw.NIP": nip,
            "ts.TAHUN_AJARAN_ID": tahunAjaranId
        })
        .select(
            "ms.NIS",
            "ms.NAMA",
            "ms.GENDER",
            "ms.FOTO",
            "tw.KELAS_ID",
            "mr.NAMA_RUANG"
        )
        .orderBy("ms.NAMA", "asc");

    return rows;
};

// 12. Fungsi untuk mendapatkan info kelas dari wali kelas
export const getKelasInfoByWali = async (nip) => {
    const result = await db("transaksi_guru_wakel as tw")
        .leftJoin("master_kelas as mk", "tw.KELAS_ID", "mk.KELAS_ID")
        .leftJoin("master_ruang as mr", "mk.RUANG_ID", "mr.RUANG_ID")
        .leftJoin("master_tingkatan as mt", "tw.TINGKATAN_ID", "mt.TINGKATAN_ID")
        .leftJoin("master_jurusan as mj", "tw.JURUSAN_ID", "mj.JURUSAN_ID")
        .where("tw.NIP", nip)
        .select(
            "tw.KELAS_ID",
            "mr.NAMA_RUANG",
            "mt.TINGKATAN",
            "mj.NAMA_JURUSAN"
        )
        .first();

    return result || null;
};

// ============================================================
// TAHUN AJARAN
// ============================================================

// 13. Fungsi untuk mendapatkan tahun ajaran aktif
export const getTahunAjaranAktif = async () => {
    const result = await db("master_tahun_ajaran")
        .where("STATUS", "Aktif")
        .select("TAHUN_AJARAN_ID", "NAMA_TAHUN_AJARAN")
        .first();
    
    return result;
};

// ============================================================
// SISWA - PROFILE & DATA
// ============================================================

// 14. Fungsi untuk mendapatkan data siswa berdasarkan user ID
export const getSiswaByUserId = async (userId) => {
    const user = await db("users")
        .where({ id: userId })
        .select("id", "email", "role")
        .first();

    if (!user || user.role !== 'SISWA') return null;

    const siswaData = await db("master_siswa")
        .where("EMAIL", user.email)
        .select("NIS", "NISN", "NAMA", "GENDER", "TGL_LAHIR", "FOTO")
        .first();

    return siswaData;
};

// 15. Fungsi untuk mendapatkan daftar tahun ajaran siswa (tahun dimana siswa terdaftar)
export const getTahunAjaranSiswa = async (NIS) => {
    const rows = await db("transaksi_siswa_kelas as tsk")
        .join("master_tahun_ajaran as ta", "tsk.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
        .where("tsk.NIS", NIS)
        .select(
            "ta.TAHUN_AJARAN_ID",
            "ta.NAMA_TAHUN_AJARAN",
            "ta.STATUS"
        )
        .orderBy("ta.TAHUN_AJARAN_ID", "desc");

    return rows;
};

// 16. Fungsi untuk mendapatkan info kelas siswa berdasarkan tahun ajaran
export const getInfoKelasSiswa = async (NIS, TAHUN_AJARAN_ID) => {
    const result = await db("transaksi_siswa_kelas as tsk")
        .leftJoin("master_kelas as mk", "tsk.KELAS_ID", "mk.KELAS_ID")
        .leftJoin("master_ruang as mr", "mk.RUANG_ID", "mr.RUANG_ID")
        .leftJoin("master_tingkatan as mt", "tsk.TINGKATAN_ID", "mt.TINGKATAN_ID")
        .leftJoin("master_jurusan as mj", "tsk.JURUSAN_ID", "mj.JURUSAN_ID")
        .where({
            "tsk.NIS": NIS,
            "tsk.TAHUN_AJARAN_ID": TAHUN_AJARAN_ID
        })
        .select(
            "tsk.KELAS_ID",
            "mr.NAMA_RUANG",
            "mt.TINGKATAN_ID",
            "mt.TINGKATAN",
            "mj.JURUSAN_ID",
            "mj.NAMA_JURUSAN"
        )
        .first();

    return result;
};