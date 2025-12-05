import express from "express";
import * as TransaksiNilaiController from "../controllers/transaksiNilaiController.js";

const router = express.Router();

// ✅ GET — Ambil Tingkatan yang diampu guru (dari Jadwal + NIP guru)
router.get("/tingkatan-guru", TransaksiNilaiController.getTingkatanByGuru);

// ✅ GET — Ambil Jurusan yang diampu guru (dari Jadwal + NIP guru)
router.get("/jurusan-guru", TransaksiNilaiController.getJurusanByGuru);

// ✅ GET — Ambil Kelas yang diampu guru dengan filter tingkat dan jurusan
router.get("/kelas-guru", TransaksiNilaiController.getKelasByGuruFiltered);

// ✅ GET — Ambil Mata Pelajaran yang diampu guru (dari Jadwal + NIP guru)
router.get("/mapel-guru", TransaksiNilaiController.getMapelByGuru);

// ✅ GET — Ambil Kelas berdasarkan Mapel dan Guru
router.get("/kelas-by-mapel", TransaksiNilaiController.getKelasByMapelGuru);

// ✅ GET — Ambil Mata Pelajaran berdasarkan Kelas (dari Jadwal)
router.get("/mapel", TransaksiNilaiController.getMapelByKelas);

// GET — Ambil Data Entry Nilai (Siswa + Nilai + KKM + Predikat)
router.get("/", TransaksiNilaiController.getEntryPageData);

// POST — Simpan Nilai (Bulk Insert/Update)
router.post("/", TransaksiNilaiController.saveNilai);

// PUT — Update Nilai per Siswa berdasarkan ID transaksi nilai
router.put("/:id", TransaksiNilaiController.updateNilaiById);

// DELETE — Hapus Nilai berdasarkan ID transaksi nilai
router.delete("/:id", TransaksiNilaiController.deleteNilaiById);

export default router;