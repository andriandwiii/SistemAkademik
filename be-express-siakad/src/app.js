import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";
import { setResponseHeader } from "./middleware/set-headers.js";

import authRoutes from "./routes/authRoutes.js";
import siswaRoutes from "./routes/siswaRoutes.js";
import kelasRoutes from "./routes/kelasRoutes.js";
import masterGuruRoutes from "./routes/masterGuruRoutes.js";
import masterKurikulumRoutes from "./routes/masterKurikulumRoutes.js";
import masterAsetSekolahRoutes from "./routes/masterAsetSekolahRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dashboardGuruRoutes from "./routes/dashboardGuruRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import masterKelasRoutes from "./routes/masterKelasRoutes.js";
import masterWilayahRoutes from "./routes/masterWilayahRoutes.js";
import masterWaktuPelajaranRoutes from "./routes/masterWaktuPelajaranRoutes.js";
import masterUjianRoutes from "./routes/masterUjianRoutes.js";
import ortuRoutes from "./routes/orangtuaRoutes.js";
import masterJurusanRoutes from "./routes/masterJurusanRoutes.js";
import masterGedungRoutes from "./routes/masterGedungRoutes.js";
import transaksiSiswaRoutes from "./routes/transaksiSiswaRoutes.js";
import masterHariRoutes from "./routes/M.HariRoutes.js";
import mapelKelasRoutes from "./routes/mapelKelasRoutes.js";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import absensiRoutes from "./routes/absensiRoutes.js";
import masterInfoSekolahRoutes from "./routes/masterInfoSekolahRoutes.js";
import masterTingkatanRoutes from "./routes/masterTingkatanRoutes.js";
import masterRuangRoutes from "./routes/masterRuangKelasRoutes.js";
import masterTahunAjaranRoutes from "./routes/masterTahunAjaranRoutes.js";
import masterMataPelajaranRoutes from "./routes/masterMataPelajaranRoutes.js";
import masterJabatanRoutes from "./routes/masterJabatanRoute.js";
import masterJamPelajaranRoutes from "./routes/masterJamPelajaranRoutes.js";
import agamaRoutes from "./routes/agamaRoutes.js";
import transaksiWakelRoutes from "./routes/transaksiWakelRoutes.js";
import transaksiKenaikanKelasRoutes from "./routes/transaksiKenaikanKelasRoutes.js";
import masterKKMRoutes from "./routes/masterKKMRoutes.js";
import masterPredikatRoutes from "./routes/masterPredikatRoutes.js"
import TransaksiNilaiRoutes from "./routes/transaksiNilaiRoutes.js"
import AbsensiGuruRoutes from "./routes/AbsensiGuruRoutes.js"; 
import tuAbsensiRoutes from "./routes/tuAbsensiRoutes.js";
import bkAbsensiRoutes from "./routes/bkAbsensiRoutes.js";
import laporanAbsensiRoutes from "./routes/laporanAbsensiRoutes.js";
import masterPelanggaranRoute from "./routes/masterPelanggaranRoute.js";
import dashboardTURoutes from "./routes/dashboardTURoutes.js";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Timestamp", "X-Signature"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionSuccessStatus: 200,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", [setResponseHeader], (req, res) => {
  return res.status(200).json(`Welcome to the server! ${new Date().toLocaleString()}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/master-guru", masterGuruRoutes);
app.use("/api/kurikulum", masterKurikulumRoutes);
app.use("/api/master-jabatan", masterJabatanRoutes);
app.use("/api/master-aset-sekolah", masterAsetSekolahRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard-guru", dashboardGuruRoutes);
app.use("/api/user", userRoutes);
app.use("/api/master-kelas", masterKelasRoutes);
app.use("/api/master-wilayah", masterWilayahRoutes);
app.use("/api/master-waktu-pelajaran", masterWaktuPelajaranRoutes);
app.use("/api/master-ujian", masterUjianRoutes);
app.use("/api/ortu", ortuRoutes);
app.use("/api/master-jurusan", masterJurusanRoutes);
app.use("/api/master-gedung", masterGedungRoutes);
app.use("/api/transaksi-siswa", transaksiSiswaRoutes);
app.use("/api/master-hari", masterHariRoutes);
app.use("/api/mapel-kelas", mapelKelasRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/master-infosekolah", masterInfoSekolahRoutes);
app.use("/api/master-tingkatan", masterTingkatanRoutes);
app.use("/api/master-ruang", masterRuangRoutes);
app.use("/api/master-tahun-ajaran", masterTahunAjaranRoutes);
app.use("/api/master-mata-pelajaran", masterMataPelajaranRoutes);
app.use("/api/master-jam-pelajaran", masterJamPelajaranRoutes);
app.use("/api/agama", agamaRoutes);
app.use("/api/transaksi-wakel", transaksiWakelRoutes);
app.use("/api/kenaikan-kelas", transaksiKenaikanKelasRoutes);
app.use("/api/master-kkm", masterKKMRoutes);
app.use("/api/master-predikat", masterPredikatRoutes);
app.use("/api/transaksi-nilai", TransaksiNilaiRoutes);
app.use("/api/absensi-guru", AbsensiGuruRoutes);
app.use("/api/tu-absensi", tuAbsensiRoutes);
app.use("/api/bk-absensi", bkAbsensiRoutes);
app.use("/api/laporan-absensi", laporanAbsensiRoutes);
app.use("/api/master-pelanggaran", masterPelanggaranRoute);
app.use("/api/dashboard-tu", dashboardTURoutes);


export default app;