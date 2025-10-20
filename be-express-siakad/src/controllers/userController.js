import { getAllUsers, getUserByEmail, addUser, getUserById, updateUser, deleteUser, getUsersByRole } from "../models/userModel.js";
import { registerSchema } from "../scemas/authSchema.js";
import { datetime, status } from "../utils/general.js";
import { hashPassword } from "../utils/hash.js";

// =======================
// Fetch all users
// =======================
export const fetchAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let users;

    if (role) {
      users = await getUsersByRole(role); 
    } else {
      users = await getAllUsers();
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data User kosong",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data User berhasil didapatkan",
      datetime: datetime(),
      users,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};


// =======================
// Get user by ID (SUPER ADMIN)
// =======================
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id); // Panggil model

    if (!user) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Sembunyikan password
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data user berhasil didapatkan",
      datetime: datetime(),
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};


// =======================
// Create new user (SUPER ADMIN)
// =======================
export const createNewUser = async (req, res) => {
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

    // Cek email sudah ada
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tambah user
    const user = await addUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "User berhasil ditambahkan",
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
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Update user (SUPER ADMIN)
// =======================
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Hash password jika ada
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // Update data user
    await updateUser(id, data);

    // Ambil kembali data user yang sudah diupdate
    const updatedUser = await getUserById(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil diupdate",
      datetime: datetime(),
      user: updatedUser, // sekarang ini data user lengkap
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Delete user (SUPER ADMIN)
// =======================
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteUser(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil dihapus",
      datetime: datetime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
