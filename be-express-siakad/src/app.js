import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";

import { setResponseHeader } from "./middleware/set-headers.js";
import authRoutes from "./routes/authRoutes.js";
import siswaRoutes from "./routes/siswaRoutes.js";
import kelasRoutes from "./routes/kelasRoutes.js";
import masterGuruRoutes from "./routes/masterGuruRoutes.js";
import mapelRoutes from "./routes/mapelRoutes.js";
import masterKurikulumRoutes from "./routes/masterKurikulumRoutes.js";
import masterAgamaRoutes from "./routes/masterAgamaRoutes.js";
import masterMapelRoutes from "./routes/masterMapelRoutes.js";
import masterAsetSekolahRoutes from "./routes/masterAsetSekolahRoutes.js";
import dashboardRoutes from './routes/dashboardRoutes.js';
import dashboardGuruRoutes from "./routes/dashboardGuruRoutes.js"; 
import userRoutes from "./routes/userRoutes.js";
import masterKelasRoutes from "./routes/masterKelasRoutes.js";
import masterWilayahRoutes from "./routes/masterWilayahRoutes.js"; 
import masterWaktuPelajaranRoutes from "./routes/masterWaktuPelajaranRoutes.js"; 
import masterUjianRoutes from './routes/masterUjianRoutes.js';
import ortuRoutes from "./routes/orangtuaRoutes.js";
import masterJurusanRoutes from './routes/masterJurusanRoutes.js';
import masterGedungRoutes from "./routes/masterGedungRoutes.js";
import transaksiSiswaRoutes from "./routes/transaksiSiswaRoutes.js";
import masterHariRoutes from "./routes/masterHariRoutes.js";
import mapelKelasRoutes from "./routes/mapelKelasRoutes.js";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import absensiRoutes from "./routes/absensiRoutes.js";
import masterinfosekolahRoutes from "./routes/masterInfoSekolahRoutes.js";
import masterTingkatanRoutes from "./routes/masterTingkatanRoutes.js";
import masterRuangRouter from "./routes/masterRuangKelasRoutes.js";



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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Timestamp",
      "X-Signature",
    ],
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
app.use("/api/master-mapel", mapelRoutes);
app.use("/api/kurikulum", masterKurikulumRoutes);
app.use("/api/agama", masterAgamaRoutes);

app.use("/api/master-mapel", masterMapelRoutes);
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
app.use("/api/master-infosekolah", masterinfosekolahRoutes);
app.use("/api/master-tingkatan", masterTingkatanRoutes);
app.use("/api/master-ruang", masterRuangRouter);

export default app;
