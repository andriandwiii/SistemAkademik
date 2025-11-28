"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import TabelWaktuPelajaran from "./components/tabelWaktuPelajaran"; // pastikan path benar
import FormWaktuPelajaran from "./components/formDialogWaktuPelajaran"; // pastikan path benar
import HeaderBar from "@/app/components/headerbar";
import ToastNotifier from "/app/components/ToastNotifier";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WaktuPelajaranPage = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    ID: 0,
    HARI: "",
    JAM_MULAI: "",
    JAM_SELESAI: "",
    DURASI: "",
    MATA_PELAJARAN: "",
    KELAS: "",
    RUANGAN: "",
    GURU_PENGAJAR: "",
    STATUS: "",
  });

  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  useEffect(() => {
    fetchWaktuPelajaran();
  }, []);

  const fetchWaktuPelajaran = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-waktu-pelajaran`);
      setData(res.data);
      setOriginalData(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.HARI?.trim()) newErrors.HARI = "Hari wajib diisi";
    if (!formData.JAM_MULAI?.trim()) newErrors.JAM_MULAI = "Jam Mulai wajib diisi";
    if (!formData.JAM_SELESAI?.trim()) newErrors.JAM_SELESAI = "Jam Selesai wajib diisi";
    if (!formData.MATA_PELAJARAN?.trim()) newErrors.MATA_PELAJARAN = "Mata Pelajaran wajib diisi";
    if (!formData.KELAS?.trim()) newErrors.KELAS = "Kelas wajib diisi";
    if (!formData.RUANGAN?.trim()) newErrors.RUANGAN = "Ruangan wajib diisi";
    if (!formData.GURU_PENGAJAR?.trim()) newErrors.GURU_PENGAJAR = "Guru Pengajar wajib diisi";
    if (!formData.STATUS?.trim()) newErrors.STATUS = "Status wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setData(originalData);
    } else {
      const q = keyword.toLowerCase();
      const filtered = originalData.filter(
        (item) =>
          item.HARI?.toLowerCase().includes(q) ||
          item.MATA_PELAJARAN?.toLowerCase().includes(q) ||
          item.KELAS?.toLowerCase().includes(q) ||
          item.GURU_PENGAJAR?.toLowerCase().includes(q)
      );
      setData(filtered);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isEdit = !!formData.ID;
    const url = isEdit
      ? `${API_URL}/master-waktu-pelajaran/${formData.ID}`
      : `${API_URL}/master-waktu-pelajaran`;

    try {
      if (isEdit) {
        await axios.put(url, formData);
        toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        await axios.post(url, formData);
        toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }
      fetchWaktuPelajaran();
      setDialogVisible(false);
      resetForm();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setDialogVisible(true);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus waktu pelajaran ${row.MATA_PELAJARAN} - ${row.KELAS}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-waktu-pelajaran/${row.ID}`);
          fetchWaktuPelajaran();
          toastRef.current?.showToast("00", "Data berhasil dihapus");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      ID: 0,
      HARI: "",
      JAM_MULAI: "",
      JAM_SELESAI: "",
      DURASI: "",
      MATA_PELAJARAN: "",
      KELAS: "",
      RUANGAN: "",
      GURU_PENGAJAR: "",
      STATUS: "",
    });
    setErrors({});
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Waktu Pelajaran</h3>

      <div className="flex items-center justify-end">
        <HeaderBar
          title=""
          placeholder="Cari Hari/Mapel/Kelas/Guru"
          onSearch={handleSearch}
          onAddClick={() => {
            resetForm();
            setDialogVisible(true);
          }}
        />
      </div>

      <TabelWaktuPelajaran
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormWaktuPelajaran
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          resetForm();
        }}
        onChange={setFormData}
        onSubmit={handleSubmit}
        formData={formData}
        errors={errors}
      />
    </div>
  );
};

export default WaktuPelajaranPage;
