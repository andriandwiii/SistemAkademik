"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FilterTanggal from "../../../components/filterTanggal";
import FormSiswa from "./components/SiswaDetailDialog";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";
import SiswaDetailDialog from "./components/SiswaDetailDialog";
import dynamic from "next/dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

export default function SiswaPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");

  const [dataSiswa, setDataSiswa] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchData(t);
    }
  }, []);

  // 🔹 Ambil data siswa
  const fetchData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const sorted = res.data.data.sort((a, b) => a.SISWA_ID - b.SISWA_ID);
      setDataSiswa(sorted);
      setOriginalData(sorted);
    } catch (err) {
      console.error("Gagal ambil data siswa:", err);
      toastRef.current?.showToast("01", "Gagal memuat data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 Searching
  const handleSearch = (keyword) => {
    if (!keyword) {
      setDataSiswa(originalData);
    } else {
      const filtered = originalData.filter(
        (s) =>
          s.NAMA.toLowerCase().includes(keyword.toLowerCase()) ||
          s.NIS.toLowerCase().includes(keyword.toLowerCase()) ||
          s.NISN.toLowerCase().includes(keyword.toLowerCase())
      );
      setDataSiswa(filtered);
    }
  };

  // 📅 Filter tanggal lahir
  const handleDateFilter = () => {
    if (!startDate && !endDate) return setDataSiswa(originalData);
    const filtered = originalData.filter((item) => {
      const birthDate = new Date(item.TGL_LAHIR);
      const from = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const to = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
      return (!from || birthDate >= from) && (!to || birthDate <= to);
    });
    setDataSiswa(filtered);
  };

  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDataSiswa(originalData);
  };

  // 💾 Simpan siswa
  const handleSubmit = async (formData) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (selectedSiswa) {
        await axios.put(`${API_URL}/siswa/${selectedSiswa.SISWA_ID}`, formData, config);
        toastRef.current?.showToast("00", "Data siswa berhasil diperbarui");
      } else {
        const res = await axios.post(`${API_URL}/auth/register-siswa`, formData, config);
        toastRef.current?.showToast("00", "Siswa baru berhasil ditambahkan");
        if (res.data.siswa_id) {
          fetchData(token);
        }
      }

      setDialogVisible(false);
      setSelectedSiswa(null);
    } catch (err) {
      console.error("Gagal simpan siswa:", err);
      toastRef.current?.showToast("01", "Gagal menyimpan data siswa");
    }
  };

  // ✏️ Edit data
  const handleEdit = (row) => {
    setSelectedSiswa(row);
    setDialogVisible(true);
  };

  // 🔍 Detail siswa
  const handleDetail = (row) => {
    setDetailSiswa(row);
    setDetailDialogVisible(true);
  };

  // ❌ Hapus siswa
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus siswa "${row.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/siswa/${row.SISWA_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data siswa berhasil dihapus");
          fetchData(token);
        } catch (err) {
          console.error("Gagal hapus siswa:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data siswa");
        }
      },
    });
  };

  // 🔹 Kolom tabel
  const columns = [
    { field: "NIS", header: "NIS", style: { minWidth: "120px" } },
    { field: "NISN", header: "NISN", style: { minWidth: "120px" } },
    { field: "NAMA", header: "Nama", style: { minWidth: "200px" } },
    {
      field: "GENDER",
      header: "Jenis Kelamin",
      style: { minWidth: "120px" },
      body: (row) => (row.GENDER === "L" ? "Laki-laki" : "Perempuan"),
    },
    {
      field: "TGL_LAHIR",
      header: "Tanggal Lahir",
      style: { minWidth: "120px" },
      body: (row) =>
        row.TGL_LAHIR ? new Date(row.TGL_LAHIR).toLocaleDateString("id-ID") : "-",
    },
    { field: "TEMPAT_LAHIR", header: "Tempat Lahir", style: { minWidth: "150px" } },
    { field: "AGAMA", header: "Agama", style: { minWidth: "100px" } },
    { field: "ALAMAT", header: "Alamat", style: { minWidth: "200px" } },
    { field: "NO_TELP", header: "No. Telp", style: { minWidth: "120px" } },
    { field: "STATUS", header: "Status", style: { minWidth: "100px" } },
    {
      field: "FOTO",
      header: "Foto",
      style: { minWidth: "100px" },
      body: (row) => {
        const fotoUrl = row.FOTO
          ? row.FOTO.startsWith("http")
            ? row.FOTO
            : `${API_URL.replace("/api", "")}${row.FOTO}`
          : null;
        return fotoUrl ? (
          <img
            src={fotoUrl}
            alt={row.NAMA}
            className="w-12 h-12 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <span>-</span>
        );
      },
    },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-search" size="small" severity="info" onClick={() => handleDetail(row)} />
          <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => handleEdit(row)} />
          <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: "150px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Siswa</h3>

      {/* 🔹 Toolbar & Filter */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4">
        <FilterTanggal
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleDateFilter={handleDateFilter}
          resetFilter={resetFilter}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Atur Print Margin"
            onClick={() => {
              handleDateFilter();
              setAdjustDialog(true);
            }}
          />

          <HeaderBar
            title=""
            placeholder="Cari siswa berdasarkan nama, NIS, atau NISN"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedSiswa(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      <CustomDataTable data={dataSiswa} columns={columns} loading={isLoading} />

      {/* 🔹 Form Tambah/Edit */}
      <FormSiswa
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedSiswa(null);
        }}
        onSave={handleSubmit}
        selectedSiswa={selectedSiswa}
        token={token}
      />

      {/* 🔹 Detail Siswa */}
      <SiswaDetailDialog
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
        siswa={detailSiswa}
      />

      {/* 🔹 Print Margin */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataSiswa={dataSiswa}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Siswa"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}
