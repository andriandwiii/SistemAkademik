// File: app/(main)/master/transaksi-siswa-naik/page.js

"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import ToastNotifier from "../../../components/ToastNotifier";

// VVVV PENTING VVVV
// Impor FormKenaikanKelas dari folder components-nya sendiri
import FormKenaikanKelas from "./components/FormKenaikanKelas.js";
// (Pastikan Anda memindahkan file FormKenaikanKelas.js ke folder ini)

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function KenaikanKelasPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);
  const [token, setToken] = useState("");
  
  // State untuk memunculkan dialog wizard
  const [kenaikanDialogVisible, setKenaikanDialogVisible] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handler untuk memanggil API Kenaikan Kelas Massal
  const handleKenaikanKelasSubmit = async (data) => {
    try {
      // Panggil API Kenaikan Kelas (POST /api/kenaikan-kelas)
      const res = await axios.post(`${API_URL}/kenaikan-kelas`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", res.data.message || "Proses Kenaikan Kelas Berhasil");
      } else {
        toastRef.current?.showToast("01", res.data.message || "Proses Kenaikan Kelas Gagal");
        return; 
      }
  
      if (isMounted.current) {
        setKenaikanDialogVisible(false); // Tutup dialog
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal memanggil API Kenaikan Kelas");
    }
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />

      <h3 className="text-xl font-semibold mb-3">Master Kenaikan Kelas</h3>
      <p className="text-gray-600 mb-4">
        Gunakan fitur ini di **akhir tahun ajaran** untuk memindahkan siswa secara massal.
        <br />
        Fitur ini akan membuat riwayat baru untuk siswa di tahun ajaran baru dan menonaktifkan tahun ajaran saat ini.
      </p>

      <Button
        label="Mulai Proses Kenaikan Kelas"
        icon="pi pi-fw pi-upload"
        className="p-button-success p-button-lg"
        onClick={() => setKenaikanDialogVisible(true)}
      />

      {/* DIALOG WIZARD KENAIKAN KELAS */}
      <FormKenaikanKelas
        visible={kenaikanDialogVisible}
        onHide={() => setKenaikanDialogVisible(false)}
        onSave={handleKenaikanKelasSubmit} // <-- Memanggil handler Kenaikan Kelas Massal
        token={token}
      />
    </div>
  );
}