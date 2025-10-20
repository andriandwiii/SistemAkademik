import { z } from "zod";
export const siswaSchema = z.object({
  NIS: z.string().min(10, "NIS minimal 10 karakter").max(15, "NIS maksimal 15 karakter"),
  NISN: z.string().min(10, "NISN minimal 10 karakter").max(15, "NISN maksimal 15 karakter"),
  NAMA: z.string().min(3, "Nama minimal 3 karakter"),
  GENDER: z.enum(["L", "P"], "Gender tidak valid"), 
  TGL_LAHIR: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Tanggal lahir tidak valid",
  }), 
  STATUS: z.enum(["Aktif", "Lulus", "Nonaktif"], "Status tidak valid"),
  EMAIL: z.string().email("Email tidak valid"),
});

