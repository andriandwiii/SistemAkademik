import axios, { AxiosError } from "axios";

// Ambil URL dari environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// tipe user
export interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

// LOGIN
export const login = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>; // beri tahu TS struktur data
    throw new Error(error.response?.data?.detail || "Login failed");
  }
};

// LOGOUT
export const logout = async (token: string) => {
  try {
    await axiosInstance.post(
      "/auth/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err: unknown) {
    console.error("Logout failed:", err);
  }
};

// GET ALL USERS
export const getUsers = async (token: string): Promise<User[]> => {
  const res = await axiosInstance.get("/user/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.users;
};

// CREATE USER
export const createUser = async (token: string, user: User) => {
  const res = await axiosInstance.post("/user/", user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// UPDATE USER
export const updateUser = async (token: string, id: number, user: User) => {
  const res = await axiosInstance.put(`/user/${id}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// DELETE USER
export const deleteUser = async (token: string, id: number) => {
  const res = await axiosInstance.delete(`/user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// GET USERS BY ROLE
export const getUsersByRole = async (token: string, role: string): Promise<User[]> => {
  const res = await axiosInstance.get(`/user/?role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.users;
};