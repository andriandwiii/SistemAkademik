import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(
    [
      "SUPER_ADMIN",
      "KURIKULUM",
      "KESISWAAN",
      "KEUANGAN",
      "TU_TASM",
      "BP_BKM",
      "ADMIN_WEB",
      "GURU",
      "SISWA",
    ],
    { message: "Role tidak valid" }
  ).default("SISWA"),
});

// Schema siswa lengkap + orang tua/wali (tanpa kelas, jurusan, tahun_masuk)
export const registerSiswaSchema = z.object({
  // Data identitas siswa
  nis: z.string().min(5, "NIS wajib diisi"),
  nisn: z.string().min(10, "NISN wajib diisi"),
  nama: z.string().min(3, "Nama wajib diisi"),
  gender: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih" }),
  tempat_lahir: z.string().optional(),
  tgl_lahir: z
    .string({ required_error: "Tanggal lahir wajib diisi" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  email: z.string().email("Email tidak valid"),
  status: z.enum(["Aktif", "Nonaktif"]).default("Aktif"),
  password: z.string().min(8, "Password minimal 8 karakter"),

  // Data tambahan siswa
  alamat: z.string().optional(),
  agama: z.string().optional(),
  no_telp: z.string().optional(),
  gol_darah: z.string().optional(),
  tinggi: z.number().optional(),
  berat: z.number().optional(),
  kebutuhan_khusus: z.string().optional(),
  foto: z.string().optional(),

  // Data orang tua/wali
  orang_tua: z
    .array(
      z.object({
        jenis: z.enum(["Ayah", "Ibu", "Wali"], { message: "Jenis orang tua/wali wajib diisi" }),
        nama: z.string().min(3, "Nama orang tua/wali wajib diisi"),
        pekerjaan: z.string().optional(),
        pendidikan: z.string().optional(),
        alamat: z.string().optional(),
        no_hp: z.string().optional(),
      })
    )
    .optional(),
});



export const registerGuruSchema = z.object({
  nip: z.string().min(5, "NIP harus diisi"),
  nama: z.string().min(3, "Nama lengkap harus diisi"),
  gelar_depan: z.string().optional(),
  gelar_belakang: z.string().optional(),
  pangkat: z.string().optional(),
  jabatan: z.string().optional(),
  
  // ✅ Sesuai enum di DB
  status_kepegawaian: z.enum(["Aktif", "Cuti", "Pensiun"]).default("Aktif"),

  gender: z.enum(["L", "P"]),
  tgl_lahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  tempat_lahir: z.string().optional(),

  email: z.string().email("Format email tidak valid"),
  no_telp: z.string().optional(),
  alamat: z.string().optional(),

  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
