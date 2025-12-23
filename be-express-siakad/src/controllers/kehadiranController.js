import * as KehadiranModel from "../models/kehadiranModel.js";

// ✅ 1. Ambil Data
export const getKehadiranSiswa = async (req, res) => {
    try {
        const { kelas_id, tahun_ajaran_id, semester } = req.query;
        const data = await KehadiranModel.getKehadiranSiswaByKelas({
            KELAS_ID: kelas_id,
            TAHUN_AJARAN_ID: tahun_ajaran_id,
            SEMESTER: semester || "1"
        });
        res.status(200).json({ status: "00", data });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
};

// ✅ 2. Simpan Data
export const saveKehadiran = async (req, res) => {
    try {
        const { students, data_kehadiran, kelas_id, tahun_ajaran_id, semester } = req.body;
        const listSiswa = students || data_kehadiran;

        for (const s of listSiswa) {
            await KehadiranModel.saveKehadiranSiswaModel({
                NIS: s.NIS,
                KELAS_ID: kelas_id,
                TAHUN_AJARAN_ID: tahun_ajaran_id,
                SEMESTER: semester || "1",
                SAKIT: s.SAKIT || 0,
                IZIN: s.IZIN || 0,
                ALPA: s.ALPA || 0
            });
        }
        res.status(200).json({ status: "00", message: "Simpan berhasil" });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
};

// ✅ 3. Hapus Data (PASTIKAN NAMA INI ADA DAN DI-EXPORT)
export const deleteKehadiran = async (req, res) => {
    try {
        const { nis } = req.params;
        const { kelas_id, tahun_ajaran_id, semester } = req.query;

        await KehadiranModel.deleteKehadiranModel({
            NIS: nis,
            KELAS_ID: kelas_id,
            TAHUN_AJARAN_ID: tahun_ajaran_id,
            SEMESTER: semester || "1"
        });

        res.status(200).json({ status: "00", message: "Data dihapus" });
    } catch (err) {
        res.status(500).json({ status: "99", message: err.message });
    }
};