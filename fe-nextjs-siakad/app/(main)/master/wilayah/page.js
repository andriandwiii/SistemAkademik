"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import TabelWilayah from "./components/tabelWilayah"; // Make sure path is correct
import FormWilayah from "./components/formDialogWilayah"; // Make sure path is correct
import HeaderBar from "@/app/components/headerbar";
import ToastNotifier from "/app/components/toastNotifier";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WilayahPage = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    ID: "", // Ensure ID is handled as string or number
    PROVINSI: "",
    KABUPATEN: "",
    KECAMATAN: "",
    DESA_KELURAHAN: "",
    KODEPOS: "",
    RT: "",
    RW: "",
    JALAN: "",
    STATUS: "Aktif",
  });

  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  useEffect(() => {
    fetchWilayah();
  }, []);

  const fetchWilayah = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-wilayah`);
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
    if (!formData.PROVINSI?.trim()) newErrors.PROVINSI = "Provinsi wajib diisi";
    if (!formData.KABUPATEN?.trim()) newErrors.KABUPATEN = "Kabupaten wajib diisi";
    if (!formData.KECAMATAN?.trim()) newErrors.KECAMATAN = "Kecamatan wajib diisi";
    if (!formData.DESA_KELURAHAN?.trim()) newErrors.DESA_KELURAHAN = "Desa/Kelurahan wajib diisi";
    if (!formData.KODEPOS?.trim()) newErrors.KODEPOS = "Kode Pos wajib diisi";
    if (!formData.RT?.trim()) newErrors.RT = "RT wajib diisi";
    if (!formData.RW?.trim()) newErrors.RW = "RW wajib diisi";
    if (!formData.JALAN?.trim()) newErrors.JALAN = "Jalan wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setData(originalData);
    } else {
      const filtered = originalData.filter(
        (item) =>
          item.PROVINSI.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KABUPATEN.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KECAMATAN.toLowerCase().includes(keyword.toLowerCase())
      );
      setData(filtered);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isEdit = !!formData.ID;
    const url = isEdit
      ? `${API_URL}/master-wilayah/${formData.ID}`
      : `${API_URL}/master-wilayah`;

    try {
      if (isEdit) {
        await axios.put(url, formData);
        toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        await axios.post(url, formData);
        toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }
      fetchWilayah();
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
      message: `Apakah Anda yakin ingin menghapus wilayah ${row.PROVINSI}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-wilayah/${row.ID}`);
          fetchWilayah();
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
      ID: "",
      PROVINSI: "",
      KABUPATEN: "",
      KECAMATAN: "",
      DESA_KELURAHAN: "",
      KODEPOS: "",
      RT: "",
      RW: "",
      JALAN: "",
      STATUS: "Aktif",
    });
    setErrors({});
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Wilayah</h3>

      <div className="flex items-center justify-end">
        <HeaderBar
          title=""
          placeholder="Cari Wilayah"
          onSearch={handleSearch}
          onAddClick={() => {
            resetForm();
            setDialogVisible(true);
          }}
        />
      </div>

      <TabelWilayah
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormWilayah
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

export default WilayahPage;
