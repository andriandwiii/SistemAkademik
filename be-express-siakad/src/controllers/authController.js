import { getUserByEmail, addUser, getUsersByRole } from "../models/userModel.js";
import { addSiswa } from "../models/siswaModel.js";
import { addGuru } from "../models/guruModel.js";
import { addOrtu } from "../models/orangtuaModel.js";
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
    // Validasi request
    const validation = registerGuruSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "01",
        message: "Validasi gagal",
        datetime: new Date().toISOString(),
        errors: validation.error.errors.map(err => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const parsed = validation.data;

    // Hash password via helper
    const hashedPassword = await hashPassword(parsed.password);

    // Buat user akun
    const user = await addUser({
      name: parsed.nama,
      email: parsed.email,
      password: hashedPassword,
      role: "GURU", // ⬅️ konsisten uppercase
    });

    // Buat data guru
    const guru = await addGuru({
      user_id: user.id,
      NIP: parsed.nip,
      NAMA: parsed.nama,
      GELAR_DEPAN: parsed.gelar_depan,
      GELAR_BELAKANG: parsed.gelar_belakang,
      PANGKAT: parsed.pangkat,
      JABATAN: parsed.jabatan,
      STATUS_KEPEGAWAIAN: parsed.status_kepegawaian,
      GENDER: parsed.gender,
      TGL_LAHIR: parsed.tgl_lahir,
      TEMPAT_LAHIR: parsed.tempat_lahir,
      EMAIL: parsed.email,
      NO_TELP: parsed.no_telp,
      ALAMAT: parsed.alamat,
      created_by: user.id,
      updated_by: user.id,
    });

    res.status(201).json({
      status: "00",
      message: "Registrasi guru berhasil",
      data: guru,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "01",
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: new Date().toISOString(),
    });
  }
};

/**
 * REGISTER SISWA + ORANG TUA/WALI (Tanpa Kelas/Jurusan/Tahun Masuk)
 */
export const registerSiswa = async (req, res) => {
  try {
    // Validasi request body
    const validation = registerSiswaSchema.safeParse(req.body);

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
      foto,
      alamat,
      agama,
      no_telp,
      orang_tua, // Array [{jenis, nama, pekerjaan, pendidikan, alamat, no_hp}]
    } = validation.data;

    // Cek duplikasi email
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Cek duplikasi NIS
    const existingNis = await db("m_siswa").where({ NIS: nis }).first();
    if (existingNis) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NIS sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Cek duplikasi NISN
    const existingNisn = await db("m_siswa").where({ NISN: nisn }).first();
    if (existingNisn) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NISN sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Transaksi agar siswa + ortu konsisten
    await db.transaction(async (trx) => {
      // 1️⃣ Insert user
      const [userId] = await trx("users").insert({
        name: nama,
        email,
        password: hashedPassword,
        role: "SISWA",
      });

      // 2️⃣ Insert siswa (kelas, jurusan, tahun masuk tidak diisi dulu)
      const [siswaId] = await trx("m_siswa").insert({
        user_id: userId,
        NIS: nis,
        NISN: nisn,
        NAMA: nama,
        GENDER: gender,
        TEMPAT_LAHIR: tempat_lahir || null,
        TGL_LAHIR: tgl_lahir,
        AGAMA: agama || null,
        ALAMAT: alamat || null,
        NO_TELP: no_telp || null,
        EMAIL: email,
        STATUS: statusSiswa,
        GOL_DARAH: gol_darah || null,
        TINGGI: tinggi || null,
        BERAT: berat || null,
        KEBUTUHAN_KHUSUS: kebutuhan_khusus || null,
        FOTO: foto || null,
        // KELAS_ID, JURUSAN_ID, TAHUN_MASUK biarkan NULL
      });

      // 3️⃣ Insert orang tua/wali (jika ada)
      if (Array.isArray(orang_tua) && orang_tua.length > 0) {
        for (const ortu of orang_tua) {
          await trx("m_orangtua_wali").insert({
            SISWA_ID: siswaId,
            JENIS: ortu.jenis, // Ayah/Ibu/Wali
            NAMA: ortu.nama,
            PEKERJAAN: ortu.pekerjaan || null,
            PENDIDIKAN: ortu.pendidikan || null,
            ALAMAT: ortu.alamat || null,
            NO_HP: ortu.no_hp || null,
          });
        }
      }

      return res.status(201).json({
        status: status.SUKSES,
        message: "Siswa dan orang tua/wali berhasil didaftarkan",
        datetime: datetime(),
        user: {
          id: userId,
          name: nama,
          email,
          role: "SISWA",
        },
        siswa_id: siswaId,
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
