import { getUserByEmail, addUser } from "../models/userModel.js";
import { addLoginHistory } from "../models/loginHistoryModel.js";
import {
  createGuru,
  createSiswa,
  checkEmailExists,
  checkNisExists,
  checkNisnExists,
  countSuperAdmin,
  getUserProfileById,
  blacklistToken,
} from "../models/authModel.js";
import {
  registerSchema,
  registerSiswaSchema,
  loginSchema,
  registerGuruSchema,
} from "../scemas/authSchema.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { datetime, status } from "../utils/general.js";

/**
 * REGISTER GURU
 */
export const registerGuru = async (req, res) => {
  try {
    const body = req.body;
    const file = req.file;

    // Validasi
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
    const fotoPath = file ? `/uploads/foto_guru/${file.filename}` : null;

    // Gunakan model
    const { user, guru } = await createGuru(
      {
        EMAIL: parsed.email,
        NIP: parsed.nip,
        NAMA: parsed.nama,
        PANGKAT: parsed.pangkat || null,
        KODE_JABATAN: parsed.kode_jabatan || null,
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
        KEAHLIAN: parsed.keahlian || null,
      },
      {
        name: parsed.nama,
        email: parsed.email,
        password: parsed.password,
      }
    );

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
    console.error("Error registerGuru:", err);
    return res.status(500).json({
      status: "01",
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: new Date().toISOString(),
    });
  }
};

/**
 * REGISTER SISWA
 */
export const registerSiswa = async (req, res) => {
  try {
    // Parse FormData
    let parsedBody = {};
    for (const key in req.body) {
      try {
        parsedBody[key] = JSON.parse(req.body[key]);
      } catch {
        parsedBody[key] = req.body[key];
      }
    }

    // Validasi
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

    // Cek duplikasi menggunakan model
    const existingUser = await checkEmailExists(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    const existingNis = await checkNisExists(nis);
    if (existingNis) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NIS sudah terdaftar",
        datetime: datetime(),
      });
    }

    const existingNisn = await checkNisnExists(nisn);
    if (existingNisn) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NISN sudah terdaftar",
        datetime: datetime(),
      });
    }

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

    // Gunakan model untuk create siswa
    const { userId, siswaId } = await createSiswa(
      {
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
      },
      {
        name: nama,
        email,
        password,
      }
    );

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

    // Cek batasan Super Admin
    if (role === "SUPER_ADMIN") {
      const total = await countSuperAdmin();

      if (total >= 3) {
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
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        status: "01",
        message: "Token tidak valid atau tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

    // Gunakan model
    const user = await getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({
        status: "01",
        message: "User tidak ditemukan",
        datetime: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Berhasil mengambil profil user",
      datetime: new Date().toISOString(),
      user,
    });
  } catch (error) {
    console.error("Error getProfile:", error);
    return res.status(500).json({
      status: "01",
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: new Date().toISOString(),
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

    // Simpan history login
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

    // Blacklist token menggunakan model
    await blacklistToken(token, new Date(req.user.exp * 1000));

    // Simpan history logout
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