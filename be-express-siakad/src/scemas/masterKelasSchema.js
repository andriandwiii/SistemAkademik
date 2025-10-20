import { z } from "zod";

export const addMasterKelasSchema = z.object({
  kode_kelas: z
    .string()
    .min(2, "Kode kelas minimal 2 karakter")
    .max(50, "Kode kelas maksimal 50 karakter"),
  nama_kelas: z
    .string()
    .min(3, "Nama kelas minimal 3 karakter")
    .max(100, "Nama kelas maksimal 100 karakter"),
  tingkat: z
    .number({ invalid_type_error: "Tingkat harus berupa angka" })
    .min(1, "Tingkat minimal 1")
    .max(12, "Tingkat maksimal 12"),
  jurusan: z
    .string()
    .min(2, "Jurusan minimal 2 karakter")
    .max(100, "Jurusan maksimal 100 karakter"),
  status: z.enum(["aktif", "nonaktif"], {
    errorMap: () => ({ message: "Status harus 'aktif' atau 'nonaktif'" }),
  }),
});

export const updateMasterKelasSchema = z.object({
  kode_kelas: z
    .string()
    .min(2, "Kode kelas minimal 2 karakter")
    .max(50, "Kode kelas maksimal 50 karakter")
    .optional(),
  nama_kelas: z
    .string()
    .min(3, "Nama kelas minimal 3 karakter")
    .max(100, "Nama kelas maksimal 100 karakter")
    .optional(),
  tingkat: z
    .number({ invalid_type_error: "Tingkat harus berupa angka" })
    .min(1, "Tingkat minimal 1")
    .max(12, "Tingkat maksimal 12")
    .optional(),
  jurusan: z
    .string()
    .min(2, "Jurusan minimal 2 karakter")
    .max(100, "Jurusan maksimal 100 karakter")
    .optional(),
  status: z
    .enum(["aktif", "nonaktif"], {
      errorMap: () => ({ message: "Status harus 'aktif' atau 'nonaktif'" }),
    })
    .optional(),
});
