import { getUserByEmail, addUser, getUsersByRole } from "../models/userModel.js";
import { addSiswa } from "../models/siswaModel.js";
import { addGuru } from "../models/guruModel.js";
import { addLoginHistory } from "../models/loginHistoryModel.js";
import { registerSchema, registerSiswaSchema, loginSchema, registerGuruSchema } from "../scemas/authSchema.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { datetime, status } from "../utils/general.js";
import { db } from "../core/config/knex.js";

/**
 * REGISTER GURU
 */
export const registerGuru = async (req, res) => {
  try {
    // Ambil data dari form-data (bisa termasuk file foto)
    const body = req.body;
    const file = req.file; // dari multer upload.single("foto")

    // Validasi body
    const validation = registerGuruSchema.safeParse(body);
    if (!validation.success) {
      return res.status(400).json({
        status: "01",
        message: "Validasi gagal",
        datetime: new Date().toISOString(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const parsed = validation.data;

    // Hash password
    const hashedPassword = await hashPassword(parsed.password);

    // Buat akun user
    const user = await addUser({
      name: parsed.nama,
      email: parsed.email,
      password: hashedPassword,
      role: "GURU",
    });

    // Path foto (kalau ada upload)
    const fotoPath = file ? `/uploads/foto_guru/${file.filename}` : null;

    // Simpan data guru
    const guru = await addGuru({
      EMAIL: parsed.email,
      NIP: parsed.nip,
      NAMA: parsed.nama,
      PANGKAT: parsed.pangkat || null,
      JABATAN: parsed.jabatan || null,
      STATUS_KEPEGAWAIAN: parsed.status_kepegawaian || "Aktif",
      GENDER: parsed.gender,
      TGL_LAHIR: parsed.tgl_lahir || null,
      TEMPAT_LAHIR: parsed.tempat_lahir || null,
      NO_TELP: parsed.no_telp || null,
      ALAMAT: parsed.alamat || null,
      FOTO: fotoPath,
      PENDIDIKAN_TERAKHIR: parsed.pendidikan_terakhir || null,
      TAHUN_LULUS: parsed.tahun_lulus || null,
      UNIVERSITAS: parsed.universitas || null,
      NO_SERTIFIKAT_PENDIDIK: parsed.no_sertifikat_pendidik || null,
      TAHUN_SERTIFIKAT: parsed.tahun_sertifikat || null,
      MAPEL_DIAMPU: parsed.mapel_diampu || null,
    });

    return res.status(201).json({
      status: "00",
      message: "Registrasi guru berhasil",
      datetime: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      guru,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "01",
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: new Date().toISOString(),
    });
  }
};



/**
 * REGISTER SISWA + ORANG TUA/WALI (Dengan Upload Foto)
 */
export const registerSiswa = async (req, res) => {
  try {
    // Parse FormData agar aman
    let parsedBody = {};
    for (const key in req.body) {
      try {
        parsedBody[key] = JSON.parse(req.body[key]);
      } catch {
        parsedBody[key] = req.body[key];
      }
    }

    // Validasi dengan Zod
    const validation = registerSiswaSchema.safeParse(parsedBody);
    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const {
      nis,
      nisn,
      nama,
      gender,
      tempat_lahir,
      tgl_lahir,
      email,
      status: statusSiswa,
      password,
      gol_darah,
      tinggi,
      berat,
      kebutuhan_khusus,
      alamat,
      agama,
      no_telp,
      orang_tua,
    } = validation.data;

    const fotoFile = req.file ? `/uploads/foto_siswa/${req.file.filename}` : null;

    // Cek duplikasi email di tabel users
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Cek duplikasi NIS
    const existingNis = await db("master_siswa").where({ NIS: nis }).first();
    if (existingNis) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NIS sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Cek duplikasi NISN
    const existingNisn = await db("master_siswa").where({ NISN: nisn }).first();
    if (existingNisn) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NISN sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Mapping orang tua/wali
    let namaAyah, pekerjaanAyah, pendidikanAyah, alamatAyah, noTelpAyah;
    let namaIbu, pekerjaanIbu, pendidikanIbu, alamatIbu, noTelpIbu;
    let namaWali, pekerjaanWali, pendidikanWali, alamatWali, noTelpWali;

    if (Array.isArray(orang_tua)) {
      for (const ortu of orang_tua) {
        switch (ortu.jenis) {
          case "Ayah":
            namaAyah = ortu.nama;
            pekerjaanAyah = ortu.pekerjaan || null;
            pendidikanAyah = ortu.pendidikan || null;
            alamatAyah = ortu.alamat || null;
            noTelpAyah = ortu.no_hp || null;
            break;
          case "Ibu":
            namaIbu = ortu.nama;
            pekerjaanIbu = ortu.pekerjaan || null;
            pendidikanIbu = ortu.pendidikan || null;
            alamatIbu = ortu.alamat || null;
            noTelpIbu = ortu.no_hp || null;
            break;
          case "Wali":
            namaWali = ortu.nama;
            pekerjaanWali = ortu.pekerjaan || null;
            pendidikanWali = ortu.pendidikan || null;
            alamatWali = ortu.alamat || null;
            noTelpWali = ortu.no_hp || null;
            break;
        }
      }
    }

    // Transaksi agar user + siswa konsisten
    await db.transaction(async (trx) => {
      // 1️⃣ Insert user
      const [userId] = await trx("users").insert({
        name: nama,
        email,
        password: hashedPassword,
        role: "SISWA",
      });

      // 2️⃣ Insert siswa
      const [siswaId] = await trx("master_siswa").insert({
        EMAIL: email,
        NIS: nis,
        NISN: nisn,
        NAMA: nama,
        GENDER: gender,
        TEMPAT_LAHIR: tempat_lahir || null,
        TGL_LAHIR: tgl_lahir,
        AGAMA: agama || null,
        ALAMAT: alamat || null,
        NO_TELP: no_telp || null,
        STATUS: statusSiswa,
        GOL_DARAH: gol_darah || null,
        TINGGI: tinggi || null,
        BERAT: berat || null,
        KEBUTUHAN_KHUSUS: kebutuhan_khusus || null,
        FOTO: fotoFile,

        // Orang tua / wali
        NAMA_AYAH: namaAyah,
        PEKERJAAN_AYAH: pekerjaanAyah,
        PENDIDIKAN_AYAH: pendidikanAyah,
        ALAMAT_AYAH: alamatAyah,
        NO_TELP_AYAH: noTelpAyah,

        NAMA_IBU: namaIbu,
        PEKERJAAN_IBU: pekerjaanIbu,
        PENDIDIKAN_IBU: pendidikanIbu,
        ALAMAT_IBU: alamatIbu,
        NO_TELP_IBU: noTelpIbu,

        NAMA_WALI: namaWali,
        PEKERJAAN_WALI: pekerjaanWali,
        PENDIDIKAN_WALI: pendidikanWali,
        ALAMAT_WALI: alamatWali,
        NO_TELP_WALI: noTelpWali,
      });

      return res.status(201).json({
        status: status.SUKSES,
        message: "Siswa berhasil didaftarkan",
        datetime: datetime(),
        siswa_id: siswaId,
        foto: fotoFile,
        user: {
          id: userId,
          name: nama,
          email,
          role: "SISWA",
        },
      });
    });
  } catch (error) {
    console.error("Error registerSiswa:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * REGISTER (umum)
 */
export const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { name, email, password, role } = validation.data;

    // ✅ cek apakah super admin sudah ada
    if (role === "SUPER_ADMIN") {
      const countSuperAdmin = await db("users").where({ role: "SUPER_ADMIN" }).count("id as total");
      
      if (countSuperAdmin[0].total >= 3) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Maksimal 3 Super Admin sudah terdaftar.",
          datetime: datetime(),
        });
      }
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await addUser({ name, email, password: hashedPassword, role });

    return res.status(201).json({
      status: status.SUKSES,
      message: "User berhasil didaftarkan",
      datetime: datetime(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { email, password } = validation.data;
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    const isPasswordTrue = await comparePassword(password, existingUser.password);
    if (!isPasswordTrue) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email atau password salah",
        datetime: datetime(),
      });
    }

    const token = await generateToken({
      userId: existingUser.id,
      role: existingUser.role,
    });

    // ✅ simpan history login
    await addLoginHistory({
      userId: existingUser.id,
      action: "LOGIN",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Login berhasil",
      datetime: datetime(),
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const userId = req.user?.userId;

    if (!token || !userId) {
      return res.status(401).json({
        status: status.TIDAK_ADA_TOKEN,
        message: "Token tidak valid atau tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ blacklist token
    await db("blacklist_tokens").insert({
      token,
      expired_at: new Date(req.user.exp * 1000),
    });

    // ✅ simpan history logout
    await addLoginHistory({
      userId,
      action: "LOGOUT",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Logout berhasil, token sudah tidak berlaku",
      datetime: datetime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
