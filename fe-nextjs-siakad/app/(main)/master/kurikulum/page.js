"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "@/app/components/ToastNotifier";
import CustomDataTable from "@/app/components/DataTable";
import FormKurikulum from "./components/formDialogKurikulum";
import AdjustPrintMarginLaporanKurikulum from "./print/AdjustPrintMarginLaporanKurikulum";
import dynamic from "next/dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

const Page = () => {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");

  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({
    KURIKULUM_ID: 0,
    NAMA_KURIKULUM: "",
    TAHUN: "",
    DESKRIPSI: "",
    STATUS: "",
  });
  const [errors, setErrors] = useState({});

  // 🔹 Print Preview State
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // 🔍 Search
  const [searchKeyword, setSearchKeyword] = useState("");

  // ✅ Ambil token dan data awal
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchData(t);
    }
  }, []);

  // ✅ Fetch data
  const fetchData = async (t) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/kurikulum`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const sorted = res.data.data
        ? res.data.data.sort((a, b) => b.KURIKULUM_ID - a.KURIKULUM_ID)
        : res.data.sort((a, b) => b.KURIKULUM_ID - a.KURIKULUM_ID);
      setData(sorted);
      setOriginalData(sorted);
    } catch (err) {
      console.error("Gagal memuat data kurikulum:", err);
      toastRef.current?.showToast("01", "Gagal memuat data kurikulum");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search handler
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      setData(originalData);
    } else {
      const filtered = originalData.filter(
        (k) =>
          k.NAMA_KURIKULUM?.toLowerCase().includes(keyword.toLowerCase()) ||
          k.TAHUN?.toString().includes(keyword.toLowerCase()) ||
          k.STATUS?.toLowerCase().includes(keyword.toLowerCase())
      );
      setData(filtered);
    }
  };

  // ✅ Validasi form
  const validateForm = () => {
    const newErrors = {};
    if (!form.NAMA_KURIKULUM?.trim())
      newErrors.NAMA_KURIKULUM = "Nama Kurikulum wajib diisi";
    if (!form.TAHUN?.trim()) newErrors.TAHUN = "Tahun wajib diisi";
    if (!form.STATUS?.trim()) newErrors.STATUS = "Status wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Simpan (Tambah/Edit)
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const isEdit = !!form.KURIKULUM_ID;
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/kurikulum/${form.KURIKULUM_ID}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        await axios.post(`${API_URL}/kurikulum`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }
      fetchData(token);
      setDialogVisible(false);
      resetForm();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

  // ✅ Edit data
  const handleEdit = (row) => {
    setForm({ ...row });
    setDialogVisible(true);
  };

  // ✅ Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus kurikulum "${row.NAMA_KURIKULUM}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/kurikulum/${row.KURIKULUM_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          fetchData(token);
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      KURIKULUM_ID: 0,
      NAMA_KURIKULUM: "",
      TAHUN: "",
      DESKRIPSI: "",
      STATUS: "",
    });
    setErrors({});
  };

  // ✅ Kolom tabel
  const columns = [
    { field: "KURIKULUM_ID", header: "ID", style: { width: "70px" } },
    { field: "NAMA_KURIKULUM", header: "Nama Kurikulum" },
    { field: "TAHUN", header: "Tahun" },
    { field: "DESKRIPSI", header: "Deskripsi" },
    { field: "STATUS", header: "Status" },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => handleEdit(row)}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">Master Kurikulum</h3>

      {/* 🔹 Atas: Print | Search | Tambah (UI profesional & sejajar) */}
      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        {/* Tombol Print */}
        <Button
          icon="pi pi-print"
          severity="warning"
          onClick={() => setAdjustDialog(true)}
        />

        {/* Search Bar */}
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari kurikulum..."
            className="w-64"
          />
        </span>

        {/* Tombol Tambah */}
        <Button
          label="Tambah Kurikulum"
          icon="pi pi-plus"
          onClick={() => {
            resetForm();
            setDialogVisible(true);
          }}
        />
      </div>

      {/* 🔹 Tabel */}
      <CustomDataTable data={data} columns={columns} loading={loading} />

      {/* 🔹 Form Dialog */}
      <FormKurikulum
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          resetForm();
        }}
        onChange={setForm}
        onSubmit={handleSubmit}
        formData={form}
        errors={errors}
      />

      {/* 🔹 Print & PDF Preview */}
      <AdjustPrintMarginLaporanKurikulum
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKurikulum={data}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Kurikulum"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
};

export default Page;
