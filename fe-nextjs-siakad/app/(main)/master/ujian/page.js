"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
// Hapus import yang tidak digunakan jika ada
import HeaderBar from "@/app/components/headerbar";
import TabelUjian from "./components/tabelUjian";
import FormDialogUjian from "./components/formDialogUjian";
import ToastNotifier from "/app/components/toastNotifier";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({ NAMA_UJIAN: "", JENIS_UJIAN: "", TANGGAL_UJIAN: "", MAPEL_ID: "" });
  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  // --- LANGKAH 1: Tambah State Baru ---
  const [mapelOptions, setMapelOptions] = useState([]); // BARU: State untuk dropdown mapel

  useEffect(() => {
    fetchData();
    fetchMapelOptions(); // MODIFIKASI: Panggil fungsi fetch mapel
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-ujian`);
      setData(res.data);
    } catch (err) {
      console.error("Gagal ambil data ujian:", err);
      toastRef.current?.showToast("01", "Gagal mengambil data ujian");
    } finally {
      setLoading(false);
    }
  };

  // --- LANGKAH 2 & 3: Buat Fungsi untuk Mengambil & Transformasi Data Mapel ---
  // BARU: Fungsi untuk mengambil data mata pelajaran
  const fetchMapelOptions = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-mapel`);
      // Transformasi data agar sesuai format Dropdown PrimeReact { label, value }
      const options = res.data.map((mapel) => ({
        label: mapel.NAMA_MAPEL, // Asumsi nama kolom adalah NAMA_MAPEL
        value: mapel.MAPEL_ID,   // Asumsi nama kolom adalah MAPEL_ID
      }));
      setMapelOptions(options);
    } catch (err) {
      console.error("Gagal ambil data mata pelajaran:", err);
      toastRef.current?.showToast("01", "Gagal mengambil data mata pelajaran");
    }
  };

  const validateForm = () => {
    // ... (fungsi validateForm tidak berubah)
    const newErrors = {};
    if (!form.NAMA_UJIAN.trim()) newErrors.NAMA_UJIAN = "Nama ujian wajib diisi";
    if (!form.JENIS_UJIAN) newErrors.JENIS_UJIAN = "Jenis ujian wajib diisi";
    if (!form.TANGGAL_UJIAN.trim()) newErrors.TANGGAL_UJIAN = "Tanggal ujian wajib diisi";
    if (!form.MAPEL_ID) newErrors.MAPEL_ID = "Mata pelajaran wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // ... (fungsi handleSubmit tidak berubah)
    if (!validateForm()) return;
    const isEdit = !!form.UJIAN_ID;
    const url = isEdit
      ? `${API_URL}/master-ujian/${form.UJIAN_ID}`
      : `${API_URL}/master-ujian`;
    try {
      if (isEdit) {
        await axios.put(url, form);
        toastRef.current?.showToast("00", "Data ujian berhasil diperbarui");
      } else {
        await axios.post(url, form);
        toastRef.current?.showToast("00", "Data ujian berhasil ditambahkan");
      }
      fetchData();
      setDialogVisible(false);
      setForm({ NAMA_UJIAN: "", JENIS_UJIAN: "", TANGGAL_UJIAN: "", MAPEL_ID: "" });
    } catch (err) {
      console.error("Gagal simpan data:", err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleEdit = (row) => {
    // ... (fungsi handleEdit tidak berubah)
    setForm(row);
    setErrors({});
    setDialogVisible(true);
  };

  const handleDelete = (row) => {
    // ... (fungsi handleDelete tidak berubah)
    confirmDialog({
      message: `Yakin hapus '${row.NAMA_UJIAN}'?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-ujian/${row.UJIAN_ID}`);
          fetchData();
          toastRef.current?.showToast("00", "Data berhasil dihapus");
        } catch (err) {
          console.error("Gagal hapus data:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Ujian</h3>

      <HeaderBar
        title=""
        placeholder="Cari nama ujian"
        // ... (HeaderBar tidak berubah)
        onAddClick={() => {
          setForm({ NAMA_UJIAN: "", JENIS_UJIAN: "", TANGGAL_UJIAN: "", MAPEL_ID: "" });
          setErrors({});
          setDialogVisible(true);
        }}
      />

      <TabelUjian
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* --- LANGKAH 5: Lewatkan State sebagai Prop --- */}
      <FormDialogUjian
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setForm({ NAMA_UJIAN: "", JENIS_UJIAN: "", TANGGAL_UJIAN: "", MAPEL_ID: "" });
          setErrors({});
        }}
        onSubmit={handleSubmit}
        formData={form}
        onChange={setForm}
        errors={errors}
        mapelOptions={mapelOptions} // MODIFIKASI: Kirim data mapel ke komponen anak
      />
    </div>
  );
};

export default Page;