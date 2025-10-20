import { z } from "zod";

export const addMasterGuruSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP minimal 5 karakter")
    .max(30, "NIP maksimal 30 karakter"),
  nama: z
    .string()
    .min(3, "Nama guru minimal 3 karakter")
    .max(120, "Nama guru maksimal 120 karakter"),
  gelar: z
    .string()
    .min(2, "Gelar minimal 2 karakter")
    .max(50, "Gelar maksimal 50 karakter")
    .optional(),
  pangkat: z
    .string()
    .min(2, "Pangkat minimal 2 karakter")
    .max(50, "Pangkat maksimal 50 karakter")
    .optional(),
  jabatan: z
    .string()
    .min(2, "Jabatan minimal 2 karakter")
    .max(50, "Jabatan maksimal 50 karakter")
    .optional(),
});

export const updateMasterGuruSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP minimal 5 karakter")
    .max(30, "NIP maksimal 30 karakter")
    .optional(),
  nama: z
    .string()
    .min(3, "Nama guru minimal 3 karakter")
    .max(120, "Nama guru maksimal 120 karakter")
    .optional(),
  gelar: z
    .string()
    .min(2, "Gelar minimal 2 karakter")
    .max(50, "Gelar maksimal 50 karakter")
    .optional(),
  pangkat: z
    .string()
    .min(2, "Pangkat minimal 2 karakter")
    .max(50, "Pangkat maksimal 50 karakter")
    .optional(),
  jabatan: z
    .string()
    .min(2, "Jabatan minimal 2 karakter")
    .max(50, "Jabatan maksimal 50 karakter")
    .optional(),
});
