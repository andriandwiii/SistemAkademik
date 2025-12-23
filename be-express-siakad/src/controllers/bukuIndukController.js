import * as Model from "../models/bukuIndukModel.js";

export const getFullDataBukuInduk = async (req, res) => {
    try {
        const { nis, tahun_ajaran_id, semester } = req.query;

        // Validasi input
        if (!nis || !tahun_ajaran_id) {
            return res.status(400).json({ status: "99", message: "NIS dan Tahun Ajaran wajib diisi." });
        }

        // 1. Cari info biodata dan kelas siswa (Wajib ada)
        const [biodata, infoKelas] = await Promise.all([
            Model.getBiodataSiswa(nis),
            Model.getKelasSiswa(nis, tahun_ajaran_id)
        ]);

        if (!biodata) return res.status(404).json({ status: "99", message: "Biodata siswa tidak ditemukan." });
        if (!infoKelas) return res.status(404).json({ status: "99", message: "Siswa belum terdaftar di kelas pada tahun ajaran ini." });

        // 2. Tarik semua data pendukung secara paralel
        const [nilaiData, absen, dataWakel, dataKepsek, refCetak] = await Promise.all([
            Model.getNilaiLengkap(nis, tahun_ajaran_id, semester || "1"),
            Model.getKehadiranSiswa(nis, tahun_ajaran_id, semester || "1"),
            Model.getWaliKelas(infoKelas.KELAS_ID),
            Model.getKepalaSekolah(),
            Model.getReferensiCetak(semester || "1")
        ]);

        const { nilaiSiswa, gabungMapel } = nilaiData;

        // 3. Logika Gabungan Nilai (Contoh: Fisika + Kimia + Biologi -> IPA)
        let finalNilai = [...nilaiSiswa];
        const uniqueIndukIds = [...new Set(gabungMapel.map(gm => gm.MAPEL_INDUK_ID))];

        uniqueIndukIds.forEach(indukId => {
            const komponenIds = gabungMapel
                .filter(gm => gm.MAPEL_INDUK_ID === indukId)
                .map(gm => gm.MAPEL_KOMPONEN_ID);
            
            const komponenNilai = nilaiSiswa.filter(n => komponenIds.includes(n.MAPEL_ID_ASLI));

            if (komponenNilai.length > 0) {
                const avgP = komponenNilai.reduce((a, b) => a + (b.NILAI_P || 0), 0) / komponenNilai.length;
                const avgK = komponenNilai.reduce((a, b) => a + (b.NILAI_K || 0), 0) / komponenNilai.length;
                
                finalNilai.push({
                    NAMA_MAPEL: indukId == 26 ? "Ilmu Pengetahuan Alam (IPA)" : "Ilmu Pengetahuan Sosial (IPS)",
                    KATEGORI: "Gabungan",
                    NILAI_P: Math.round(avgP),
                    NILAI_K: Math.round(avgK),
                    RATA_RATA: Math.round((avgP + avgK) / 2),
                    is_gabungan: true
                });
            }
        });

        // 4. Grouping Berdasarkan KATEGORI (Wajib A, Wajib B, Peminatan, dll)
        const groupedNilai = finalNilai.reduce((acc, item) => {
            const kategori = item.KATEGORI || "Lainnya";
            if (!acc[kategori]) acc[kategori] = [];
            acc[kategori].push(item);
            return acc;
        }, {});

        // 5. Final JSON Response
        return res.status(200).json({
            status: "00",
            message: "Success generate data raport",
            data: {
                biodata: {
                    ...biodata,
                    KELAS_AKTIF: infoKelas.KELAS_ID,
                    JURUSAN: infoKelas.JURUSAN_ID
                },
                akademik: {
                    tahun_ajaran: tahun_ajaran_id,
                    semester: semester,
                    nilai_raport: groupedNilai,
                    kehadiran: {
                        sakit: absen?.SAKIT || 0,
                        izin: absen?.IZIN || 0,
                        alpa: absen?.ALPA || 0
                    }
                },
                tanda_tangan: {
                    titimangsa: `${refCetak?.TEMPAT_CETAK || 'Madiun'}, ${refCetak?.TANGGAL_CETAK || '-'}`,
                    wali_kelas: {
                        nama: dataWakel?.NAMA || "-",
                        nip: dataWakel?.NIP || "-",
                        label: "Wali Kelas"
                    },
                    kepala_sekolah: {
                        nama: dataKepsek?.NAMA || "-",
                        nip: dataKepsek?.NIP || "-",
                        label: refCetak?.TULISAN_KS || "Kepala Sekolah"
                    }
                }
            }
        });

    } catch (err) {
        console.error("Error Detail:", err);
        return res.status(500).json({ status: "99", message: err.message });
    }
};