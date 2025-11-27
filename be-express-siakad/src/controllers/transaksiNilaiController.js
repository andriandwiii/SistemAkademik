import * as NilaiModel from "../models/TransaksiNilaiModel.js";

/* ===========================================================
 * HELPER: HITUNG PREDIKAT (VERSI DIBETULKAN)
 * ABCD NORMAL TANPA OTOMATIS D DI BAWAH KKM
 * =========================================================== */
const hitungPredikat = (nilai) => {
    if (nilai === null || nilai === undefined || nilai === "") return null;

    const val = parseFloat(nilai);

    if (val >= 90) return "A";
    if (val >= 80) return "B";
    if (val >= 70) return "C";
    return "D";
};

/* ===========================================================
 * HELPER: GENERATE RENTANG ABCD
 * =========================================================== */
const generateIntervalPredikat = () => {
    return {
        A: "90-100",
        B: "80-89",
        C: "70-79",
        D: "0-69"
    };
};

/* ===========================================================
 * GET ENTRY PAGE DATA
 * =========================================================== */
export const getEntryPageData = async (req, res) => {
    try {
        const { kelasId, mapelId, tahunId } = req.query;

        if (!kelasId || !mapelId || !tahunId) {
            return res.status(400).json({
                status: "99",
                message: "Parameter tidak lengkap. Wajib kelasId, mapelId, tahunId."
            });
        }

        const rawData = await NilaiModel.getEntryNilaiRapor({
            KELAS_ID: kelasId,
            KODE_MAPEL: mapelId,
            TAHUN_AJARAN_ID: tahunId
        });

        if (!rawData) {
            return res.status(404).json({
                status: "01",
                message: "Setting KKM & Predikat belum ditemukan."
            });
        }

        const { kkm, deskripsi_template, siswa } = rawData;

        const intervalPredikat = generateIntervalPredikat();

        const processedStudents = siswa.map((s) => {
            const predikatP = hitungPredikat(s.NILAI_P);
            const predikatK = hitungPredikat(s.NILAI_K);

            return {
                id: s.NIS,
                nis: s.NIS,
                nisn: s.NISN,
                nama: s.NAMA,

                nilai_p: s.NILAI_P,
                predikat_p: predikatP || "-",
                deskripsi_p: predikatP ? deskripsi_template[predikatP] : "-",

                nilai_k: s.NILAI_K,
                predikat_k: predikatK || "-",
                deskripsi_k: predikatK ? deskripsi_template[predikatK] : "-",

                status:
                    (s.NILAI_P !== null || s.NILAI_K !== null)
                        ? "saved"
                        : "editing"
            };
        });

        return res.status(200).json({
            status: "00",
            message: "Data Entry Nilai berhasil diambil.",
            meta: {
                kkm,
                kelas: kelasId,
                mapel: mapelId,
                tahun: tahunId,
                deskripsi_template,
                interval_predikat: intervalPredikat
            },
            data: processedStudents
        });

    } catch (err) {
        console.error("❌ Error getEntryPageData:", err);
        return res.status(500).json({
            status: "99",
            message: "Terjadi kesalahan server.",
            error: err.message
        });
    }
};

/* ===========================================================
 * SAVE NILAI (BULK)
 * =========================================================== */
export const saveNilai = async (req, res) => {
    try {
        const { students, kelasId, mapelId, tahunId } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                status: "99",
                message: "Tidak ada data siswa dikirim."
            });
        }

        let savedCount = 0;

        for (const s of students) {
            await NilaiModel.saveNilaiSiswa({
                NIS: s.id,
                KELAS_ID: kelasId,
                KODE_MAPEL: mapelId,
                TAHUN_AJARAN_ID: tahunId,
                SEMESTER: "1",
                NILAI_P: s.nilai_p,
                NILAI_K: s.nilai_k
            });
            savedCount++;
        }

        return res.status(200).json({
            status: "00",
            message: `Berhasil menyimpan nilai untuk ${savedCount} siswa.`
        });

    } catch (err) {
        console.error("❌ Error saveNilai:", err);
        return res.status(500).json({
            status: "99",
            message: "Gagal menyimpan nilai.",
            error: err.message
        });
    }
};

/* ===========================================================
 * UPDATE NILAI BY ID
 * =========================================================== */
export const updateNilaiById = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        await NilaiModel.updateNilaiByIdModel(id, payload);

        return res.status(200).json({
            status: "00",
            message: "Nilai berhasil diupdate."
        });

    } catch (err) {
        console.error("❌ Error updateNilaiById:", err);
        return res.status(500).json({
            status: "99",
            message: "Gagal update nilai.",
            error: err.message
        });
    }
};

/* ===========================================================
 * DELETE NILAI BY ID
 * =========================================================== */
export const deleteNilaiById = async (req, res) => {
    try {
        const { id } = req.params;

        await NilaiModel.deleteNilaiByIdModel(id);

        return res.status(200).json({
            status: "00",
            message: "Nilai berhasil dihapus."
        });

    } catch (err) {
        console.error("❌ Error deleteNilaiById:", err);
        return res.status(500).json({
            status: "99",
            message: "Gagal menghapus nilai.",
            error: err.message
        });
    }
};
