import * as Model from "../models/bukuIndukModel.js";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Helper function untuk format tanggal Indonesia
const formatTanggalIndo = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const tanggal = date.getDate();
        const bulanNama = bulan[date.getMonth()];
        const tahun = date.getFullYear();
        return `${tanggal} ${bulanNama} ${tahun}`;
    } catch (e) {
        return '-';
    }
};

// Helper function untuk response error
const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        status: "99",
        message: message
    });
};

// Helper function untuk response success
const successResponse = (res, data, message = "Success") => {
    return res.status(200).json({
        status: "00",
        message: message,
        data: data
    });
};

// ============================================================
// CORE FUNCTION - PROSES DATA RAPORT
// ============================================================

const processRaportData = async (nis, tahun_ajaran_id, semester = "1") => {
    // 1. Cari info biodata dan kelas siswa (Wajib ada)
    const [biodata, infoKelas] = await Promise.all([
        Model.getBiodataSiswa(nis),
        Model.getKelasSiswa(nis, tahun_ajaran_id)
    ]);

    if (!biodata) {
        throw new Error("Biodata siswa tidak ditemukan.");
    }
    
    if (!infoKelas) {
        throw new Error("Siswa belum terdaftar di kelas pada tahun ajaran ini.");
    }

    // 2. Tarik semua data pendukung secara paralel
    const [nilaiData, absen, dataWakel, dataKepsek, refCetak] = await Promise.all([
        Model.getNilaiLengkap(nis, tahun_ajaran_id, semester),
        Model.getKehadiranSiswa(nis, tahun_ajaran_id, semester),
        Model.getWaliKelas(infoKelas.KELAS_ID),
        Model.getKepalaSekolah(),
        Model.getReferensiCetak(semester)
    ]);

    const { nilaiSiswa, gabungMapel } = nilaiData;

    // 3. Proses nilai dan tambahkan deskripsi berdasarkan predikat
    let finalNilai = nilaiSiswa.map(item => {
        const rataRata = item.RATA_RATA || 0;
        const predikatP = Model.getPredikatByNilai(item.NILAI_P || 0);
        const predikatK = Model.getPredikatByNilai(item.NILAI_K || 0);
        
        const predikatRata = Model.getPredikatByNilai(rataRata);
        let templateDeskripsi = "";
        
        switch(predikatRata) {
            case "A": templateDeskripsi = item.DESKRIPSI_A; break;
            case "B": templateDeskripsi = item.DESKRIPSI_B; break;
            case "C": templateDeskripsi = item.DESKRIPSI_C; break;
            case "D": templateDeskripsi = item.DESKRIPSI_D; break;
        }
        
        const deskripsi = Model.generateDeskripsi(predikatRata, templateDeskripsi, item.NAMA_MAPEL);
        
        return {
            MAPEL_ID_ASLI: item.MAPEL_ID_ASLI,
            KODE_MAPEL: item.KODE_MAPEL,
            NAMA_MAPEL: item.NAMA_MAPEL,
            KATEGORI: item.KATEGORI,
            NILAI_P: item.NILAI_P,
            NILAI_K: item.NILAI_K,
            RATA_RATA: rataRata,
            PREDIKAT_P: predikatP,
            PREDIKAT_K: predikatK,
            PREDIKAT_RATA: predikatRata,
            DESKRIPSI_P: deskripsi,
            DESKRIPSI_K: deskripsi
        };
    });

    // 4. Logika Gabungan Nilai (IPA/IPS)
    const uniqueIndukIds = [...new Set(gabungMapel.map(gm => gm.MAPEL_INDUK_ID))];

    uniqueIndukIds.forEach(indukId => {
        const komponenIds = gabungMapel
            .filter(gm => gm.MAPEL_INDUK_ID === indukId)
            .map(gm => gm.MAPEL_KOMPONEN_ID);
        
        const komponenNilai = finalNilai.filter(n => komponenIds.includes(n.MAPEL_ID_ASLI));

        if (komponenNilai.length > 0) {
            const avgP = komponenNilai.reduce((a, b) => a + (b.NILAI_P || 0), 0) / komponenNilai.length;
            const avgK = komponenNilai.reduce((a, b) => a + (b.NILAI_K || 0), 0) / komponenNilai.length;
            const avgRata = Math.round((avgP + avgK) / 2);
            
            const namaGabungan = indukId == 26 ? "Ilmu Pengetahuan Alam (IPA)" : "Ilmu Pengetahuan Sosial (IPS)";
            const predikatGabungan = Model.getPredikatByNilai(avgRata);
            
            finalNilai.push({
                NAMA_MAPEL: namaGabungan,
                KATEGORI: "Gabungan",
                NILAI_P: Math.round(avgP),
                NILAI_K: Math.round(avgK),
                RATA_RATA: avgRata,
                PREDIKAT_P: Model.getPredikatByNilai(Math.round(avgP)),
                PREDIKAT_K: Model.getPredikatByNilai(Math.round(avgK)),
                PREDIKAT_RATA: predikatGabungan,
                DESKRIPSI_P: `Menunjukkan pemahaman yang ${predikatGabungan === 'A' ? 'sangat baik' : predikatGabungan === 'B' ? 'baik' : predikatGabungan === 'C' ? 'cukup' : 'perlu ditingkatkan'} dalam ${namaGabungan}.`,
                DESKRIPSI_K: `Menunjukkan keterampilan yang ${predikatGabungan === 'A' ? 'sangat baik' : predikatGabungan === 'B' ? 'baik' : predikatGabungan === 'C' ? 'cukup' : 'perlu ditingkatkan'} dalam ${namaGabungan}.`,
                is_gabungan: true
            });
        }
    });

    // 5. Grouping Berdasarkan KATEGORI
    const groupedNilai = finalNilai.reduce((acc, item) => {
        const kategori = item.KATEGORI || "Lainnya";
        if (!acc[kategori]) acc[kategori] = [];
        acc[kategori].push(item);
        return acc;
    }, {});

    // 6. Return Final Data
    return {
        biodata: {
            ...biodata,
            TGL_LAHIR: formatTanggalIndo(biodata.TGL_LAHIR),
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
    };
};

// ============================================================
// ENDPOINT CONTROLLERS
// ============================================================

/**
 * GET FULL DATA BUKU INDUK (ADMIN/KURIKULUM)
 * Endpoint: /api/buku-induk/generate
 * Access: SUPER_ADMIN, KURIKULUM
 */
export const getFullDataBukuInduk = async (req, res) => {
    try {
        const { nis, tahun_ajaran_id, semester } = req.query;

        // Validasi input
        if (!nis || !tahun_ajaran_id) {
            return errorResponse(res, 400, "NIS dan Tahun Ajaran wajib diisi.");
        }

        const data = await processRaportData(nis, tahun_ajaran_id, semester || "1");
        
        return successResponse(res, data, "Success generate data raport");

    } catch (err) {
        console.error("Error getFullDataBukuInduk:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET INFO KELAS WALI KELAS
 * Endpoint: /api/buku-induk/wali-kelas/info
 * Access: GURU
 */
export const getInfoKelasWali = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil profil guru
        const userProfile = await Model.getUserProfile(userId);
        
        if (!userProfile || userProfile.role !== 'GURU') {
            return errorResponse(res, 403, "Akses ditolak. Hanya untuk guru.");
        }

        const nipGuru = userProfile.guru?.NIP;
        if (!nipGuru) {
            return errorResponse(res, 404, "Data guru tidak ditemukan");
        }

        // Ambil info kelas wali
        const kelasInfo = await Model.getKelasWaliByGuru(nipGuru);

        if (!kelasInfo) {
            return errorResponse(res, 404, "Anda belum ditugaskan sebagai wali kelas");
        }

        // Ambil tahun ajaran aktif
        const tahunAktif = await Model.getTahunAjaranAktif();

        return successResponse(res, {
            kelas_info: kelasInfo,
            tahun_ajaran_aktif: tahunAktif
        }, "Data kelas wali berhasil diambil");

    } catch (err) {
        console.error("Error getInfoKelasWali:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET SISWA KELAS WALI (BY TAHUN AJARAN)
 * Endpoint: /api/buku-induk/wali-kelas/siswa
 * Access: GURU
 */
export const getSiswaKelasWaliByTahun = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        const userId = req.user?.userId;

        if (!tahun_ajaran_id) {
            return errorResponse(res, 400, "Tahun ajaran wajib diisi");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil profil guru
        const userProfile = await Model.getUserProfile(userId);
        
        if (!userProfile || userProfile.role !== 'GURU') {
            return errorResponse(res, 403, "Akses ditolak. Hanya untuk guru.");
        }

        const nipGuru = userProfile.guru?.NIP;
        if (!nipGuru) {
            return errorResponse(res, 404, "Data guru tidak ditemukan");
        }

        // Cek apakah guru adalah wali kelas
        const kelasInfo = await Model.getKelasWaliByGuru(nipGuru);
        
        if (!kelasInfo) {
            return errorResponse(res, 404, "Anda belum ditugaskan sebagai wali kelas");
        }

        // Ambil data siswa berdasarkan kelas wali
        const siswa = await Model.getSiswaByKelasWali(nipGuru, tahun_ajaran_id);

        return successResponse(res, {
            siswa,
            kelas_info: kelasInfo,
            total_siswa: siswa.length
        }, "Data siswa berhasil diambil");

    } catch (err) {
        console.error("Error getSiswaKelasWaliByTahun:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET FULL DATA BUKU INDUK BY WALI KELAS (WITH VALIDATION)
 * Endpoint: /api/buku-induk/wali-kelas/generate
 * Access: GURU
 */
export const getFullDataBukuIndukByWaliKelas = async (req, res) => {
    try {
        const { nis, tahun_ajaran_id, semester } = req.query;
        const userId = req.user?.userId;

        // Validasi input
        if (!nis || !tahun_ajaran_id) {
            return errorResponse(res, 400, "NIS dan Tahun Ajaran wajib diisi.");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil profil guru untuk mendapatkan NIP
        const userProfile = await Model.getUserProfile(userId);
        
        if (!userProfile || userProfile.role !== 'GURU') {
            return errorResponse(res, 403, "Akses ditolak. Hanya untuk guru.");
        }

        const nipGuru = userProfile.guru?.NIP;
        if (!nipGuru) {
            return errorResponse(res, 404, "Data guru tidak ditemukan");
        }

        // 1. Cari info biodata dan kelas siswa
        const [biodata, infoKelas] = await Promise.all([
            Model.getBiodataSiswa(nis),
            Model.getKelasSiswa(nis, tahun_ajaran_id)
        ]);

        if (!biodata) {
            return errorResponse(res, 404, "Biodata siswa tidak ditemukan.");
        }
        
        if (!infoKelas) {
            return errorResponse(res, 404, "Siswa belum terdaftar di kelas pada tahun ajaran ini.");
        }

        // 2. VALIDASI: Apakah guru ini wali kelas dari siswa tersebut?
        const isWaliKelas = await Model.checkGuruIsWaliKelas(nipGuru, infoKelas.KELAS_ID);
        
        if (!isWaliKelas) {
            return errorResponse(res, 403, "Anda tidak memiliki akses untuk siswa ini. Hanya wali kelas yang bersangkutan yang dapat mencetak raport.");
        }

        // 3. Proses data raport
        const data = await processRaportData(nis, tahun_ajaran_id, semester || "1");
        
        return successResponse(res, data, "Success generate data raport");

    } catch (err) {
        console.error("Error getFullDataBukuIndukByWaliKelas:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET SISWA KELAS WALI (LEGACY - BACKWARD COMPATIBILITY)
 * Endpoint: /api/buku-induk/siswa-kelas-wali (jika masih ada yang pakai)
 * Access: GURU
 */
export const getSiswaKelasWali = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        const userId = req.user?.userId;

        if (!tahun_ajaran_id) {
            return errorResponse(res, 400, "Tahun ajaran wajib diisi");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil profil guru
        const userProfile = await Model.getUserProfile(userId);
        
        if (!userProfile || userProfile.role !== 'GURU') {
            return errorResponse(res, 403, "Akses ditolak. Hanya untuk guru.");
        }

        const nipGuru = userProfile.guru?.NIP;
        if (!nipGuru) {
            return errorResponse(res, 404, "Data guru tidak ditemukan");
        }

        // Ambil data siswa berdasarkan kelas wali
        const siswa = await Model.getSiswaByKelasWali(nipGuru, tahun_ajaran_id);

        if (siswa.length === 0) {
            return errorResponse(res, 404, "Anda belum ditugaskan sebagai wali kelas atau belum ada siswa di kelas Anda");
        }

        // Ambil info kelas
        const kelasInfo = await Model.getKelasInfoByWali(nipGuru);

        return successResponse(res, {
            siswa,
            kelas_info: kelasInfo
        }, "Data siswa berhasil diambil");

    } catch (err) {
        console.error("Error getSiswaKelasWali:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET INFO PROFILE SISWA
 * Endpoint: /api/buku-induk/siswa/profile
 * Access: SISWA
 */
export const getProfileSiswa = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil data siswa
        const siswaData = await Model.getSiswaByUserId(userId);
        
        if (!siswaData) {
            return errorResponse(res, 404, "Data siswa tidak ditemukan");
        }

        // Ambil daftar tahun ajaran siswa
        const tahunAjaranList = await Model.getTahunAjaranSiswa(siswaData.NIS);

        // Ambil tahun ajaran aktif sebagai default
        const tahunAktif = await Model.getTahunAjaranAktif();

        return successResponse(res, {
            siswa: {
                ...siswaData,
                TGL_LAHIR: formatTanggalIndo(siswaData.TGL_LAHIR)
            },
            tahun_ajaran_list: tahunAjaranList,
            tahun_ajaran_aktif: tahunAktif
        }, "Data profile siswa berhasil diambil");

    } catch (err) {
        console.error("Error getProfileSiswa:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET INFO KELAS SISWA BY TAHUN AJARAN
 * Endpoint: /api/buku-induk/siswa/kelas
 * Access: SISWA
 */
export const getInfoKelasSiswa = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        const userId = req.user?.userId;

        if (!tahun_ajaran_id) {
            return errorResponse(res, 400, "Tahun ajaran wajib diisi");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil data siswa
        const siswaData = await Model.getSiswaByUserId(userId);
        
        if (!siswaData) {
            return errorResponse(res, 404, "Data siswa tidak ditemukan");
        }

        // Ambil info kelas siswa
        const kelasInfo = await Model.getInfoKelasSiswa(siswaData.NIS, tahun_ajaran_id);

        if (!kelasInfo) {
            return errorResponse(res, 404, "Anda belum terdaftar di kelas pada tahun ajaran ini");
        }

        return successResponse(res, {
            kelas_info: kelasInfo
        }, "Data kelas berhasil diambil");

    } catch (err) {
        console.error("Error getInfoKelasSiswa:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET RAPORT SISWA (SISWA HANYA BISA LIHAT PUNYA SENDIRI)
 * Endpoint: /api/buku-induk/siswa/raport
 * Access: SISWA
 */
export const getRaportSiswa = async (req, res) => {
    try {
        const { tahun_ajaran_id, semester } = req.query;
        const userId = req.user?.userId;

        // Validasi input
        if (!tahun_ajaran_id) {
            return errorResponse(res, 400, "Tahun Ajaran wajib diisi.");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil data siswa berdasarkan user ID
        const siswaData = await Model.getSiswaByUserId(userId);
        
        if (!siswaData) {
            return errorResponse(res, 404, "Data siswa tidak ditemukan");
        }

        // Validasi apakah siswa terdaftar di tahun ajaran ini
        const infoKelas = await Model.getKelasSiswa(siswaData.NIS, tahun_ajaran_id);
        
        if (!infoKelas) {
            return errorResponse(res, 404, "Anda belum terdaftar di kelas pada tahun ajaran ini.");
        }

        // Proses data raport
        const data = await processRaportData(siswaData.NIS, tahun_ajaran_id, semester || "1");
        
        return successResponse(res, data, "Success generate data raport");

    } catch (err) {
        console.error("Error getRaportSiswa:", err);
        return errorResponse(res, 500, err.message);
    }
};

/**
 * GET LIST SEMESTER TERSEDIA UNTUK SISWA
 * Endpoint: /api/buku-induk/siswa/semester
 * Access: SISWA
 */
export const getSemesterTersedia = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        const userId = req.user?.userId;

        if (!tahun_ajaran_id) {
            return errorResponse(res, 400, "Tahun ajaran wajib diisi");
        }

        if (!userId) {
            return errorResponse(res, 401, "User tidak terautentikasi");
        }

        // Ambil data siswa
        const siswaData = await Model.getSiswaByUserId(userId);
        
        if (!siswaData) {
            return errorResponse(res, 404, "Data siswa tidak ditemukan");
        }

        // Cek semester mana saja yang sudah ada nilainya
        const semesterList = await db("transaksi_nilai")
            .where({
                NIS: siswaData.NIS,
                TAHUN_AJARAN_ID: tahun_ajaran_id
            })
            .select("SEMESTER")
            .groupBy("SEMESTER")
            .orderBy("SEMESTER", "asc");

        const availableSemesters = semesterList.map(s => ({
            value: s.SEMESTER,
            label: `Semester ${s.SEMESTER}`
        }));

        return successResponse(res, {
            semesters: availableSemesters
        }, "Data semester tersedia berhasil diambil");

    } catch (err) {
        console.error("Error getSemesterTersedia:", err);
        return errorResponse(res, 500, err.message);
    }
};