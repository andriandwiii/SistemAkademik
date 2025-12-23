import { db } from "../core/config/knex.js";

// 1. Ambil Biodata Siswa dari Master
export const getBiodataSiswa = async (NIS) => {
  return await db("master_siswa").where("NIS", NIS).first();
};

// 2. Ambil Kelas Aktif Siswa (Penting: Siswa bisa pindah kelas tiap tahun)
export const getKelasSiswa = async (NIS, TAHUN_ID) => {
  return await db("transaksi_siswa_kelas")
    .where({ NIS: NIS, TAHUN_AJARAN_ID: TAHUN_ID })
    .select("KELAS_ID", "TINGKATAN_ID", "JURUSAN_ID")
    .first();
};

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
    // Fallback jika template tidak ada
    const defaultDescriptions = {
      A: `Menunjukkan penguasaan yang sangat baik dalam ${namaMapel}, mampu menguasai seluruh kompetensi dengan sangat memuaskan.`,
      B: `Menunjukkan penguasaan yang baik dalam ${namaMapel}, mampu menguasai kompetensi dasar dengan memuaskan.`,
      C: `Menunjukkan penguasaan yang cukup dalam ${namaMapel}, perlu meningkatkan pemahaman pada beberapa kompetensi.`,
      D: `Perlu bimbingan lebih lanjut dalam ${namaMapel} untuk meningkatkan penguasaan kompetensi dasar.`
    };
    return defaultDescriptions[predikat] || defaultDescriptions.D;
  }

  // Replace placeholder {materi} dengan nama mapel
  return template.replace(/{materi}/g, namaMapel).replace(/{nama}/g, "Siswa");
};

// 4. Ambil Wali Kelas berdasarkan KELAS_ID (Join ke master_guru)
export const getWaliKelas = async (KELAS_ID) => {
  return await db("transaksi_guru_wakel as wk")
    .join("master_guru as g", "wk.NIP", "g.NIP")
    .select("g.NAMA", "g.NIP")
    .where("wk.KELAS_ID", KELAS_ID)
    .first();
};

// 5. Ambil Kepala Sekolah secara Dinamis (Berdasarkan Pangkat)
export const getKepalaSekolah = async () => {
  return await db("master_guru")
    .where("PANGKAT", "Kepala Sekolah")
    .select("NAMA", "NIP")
    .first();
};

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

// Fungsi untuk mendapatkan profil user (jika belum ada)
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

// Fungsi untuk cek apakah guru adalah wali kelas di kelas tertentu
export const checkGuruIsWaliKelas = async (nip, kelasId) => {
    const result = await db("transaksi_guru_wakel")
        .where({ 
            NIP: nip, 
            KELAS_ID: kelasId 
        })
        .first();

    return !!result; // Return true jika ditemukan
};

// Fungsi untuk mendapatkan daftar siswa berdasarkan kelas wali
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

// Fungsi untuk mendapatkan info kelas dari wali kelas
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