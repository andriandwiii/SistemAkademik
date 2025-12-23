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

// 3. Ambil Nilai & Referensi Gabungan (IPA/IPS)
export const getNilaiLengkap = async (NIS, TAHUN_ID, SEMESTER) => {
  const nilaiSiswa = await db("transaksi_nilai as tn")
    .join("master_mata_pelajaran as m", "tn.KODE_MAPEL", "m.KODE_MAPEL")
    .select(
      "m.ID as MAPEL_ID_ASLI",
      "m.KODE_MAPEL",
      "m.NAMA_MAPEL",
      "m.KATEGORI",
      "tn.NILAI_P",
      "tn.NILAI_K",
      db.raw("((tn.NILAI_P + tn.NILAI_K) / 2) as RATA_RATA")
    )
    .where({ "tn.NIS": NIS, "tn.TAHUN_AJARAN_ID": TAHUN_ID, "tn.SEMESTER": SEMESTER });

  const gabungMapel = await db("transaksi_gabung_mapel").select("MAPEL_INDUK_ID", "MAPEL_KOMPONEN_ID");

  return { nilaiSiswa, gabungMapel };
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