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



// Schema validasi untuk pendaftaran siswa (master_siswa + orang tua/wali)
export const registerSiswaSchema = z.object({
  nis: z.preprocess((v) => String(v), z.string().min(5, "NIS wajib diisi")),
  nisn: z.preprocess((v) => String(v), z.string().min(10, "NISN wajib diisi")),
  nama: z.string().min(3, "Nama wajib diisi"),
  gender: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih" }),
  tempat_lahir: z.string().optional(),
  tgl_lahir: z
    .string({ required_error: "Tanggal lahir wajib diisi" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  email: z.string().email("Email tidak valid"),
  status: z.enum(["Aktif", "Lulus", "Pindah", "Nonaktif"]).default("Aktif"),
  password: z.preprocess((v) => String(v), z.string().min(8, "Password minimal 8 karakter")),

  alamat: z.string().optional(),
  agama: z.string().optional(),
  no_telp: z.string().optional(),
  gol_darah: z.string().optional(),

  tinggi: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  berat: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),

  kebutuhan_khusus: z.string().optional(),
  foto: z.string().optional(),

  // Array opsional untuk mapping langsung ke kolom master_siswa
  orang_tua: z.preprocess((v) => {
      if (!v) return [];
      if (typeof v === "string") {
        try {
          return JSON.parse(v);
        } catch {
          return [];
        }
      }
      return v;
    }, 
    z.array(
      z.object({
        jenis: z.enum(["Ayah", "Ibu", "Wali"], { message: "Jenis orang tua/wali wajib diisi" }),
        nama: z.string().min(3, "Nama orang tua/wali wajib diisi"),
        pekerjaan: z.string().optional(),
        pendidikan: z.string().optional(),
        alamat: z.string().optional(),
        no_hp: z.string().optional(),
      })
    )
  )
});


// Schema validasi pendaftaran guru
export const registerGuruSchema = z.object({
  nip: z.string().min(5, "NIP harus diisi"),
  nama: z.string().min(3, "Nama lengkap harus diisi"),
  pangkat: z.string().optional(),

  // 🔹 ganti jabatan_id → kode_jabatan (sesuai field database)
  kode_jabatan: z
    .string()
    .min(2, "KODE_JABATAN harus diisi")
    .regex(/^[A-Z0-9]+$/, "KODE_JABATAN hanya boleh huruf besar dan angka")
    .optional(),

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

  // 🔹 Data pendidikan
  pendidikan_terakhir: z.string().optional(),
  tahun_lulus: z
    .string()
    .regex(/^\d{4}$/, "Format tahun lulus harus 4 digit")
    .optional(),
  universitas: z.string().optional(),
  no_sertifikat_pendidik: z.string().optional(),
  tahun_sertifikat: z
    .string()
    .regex(/^\d{4}$/, "Format tahun sertifikat harus 4 digit")
    .optional(),
  mapel_diampu: z.string().optional(),

  password: z.string().min(8, "Password minimal 8 karakter"),
});


// Schema validasi untuk login
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
