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
import TabelSiswa from "./components/tabelSiswa";
import FormSiswa from "./components/SiswaDetailDialog";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";
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
      const sorted = res.data.data.sort((a, b) => b.SISWA_ID - a.SISWA_ID);
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

  // 📅 Filter berdasarkan tanggal lahir
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

  // 💾 Simpan siswa (Tambah/Edit)
  const handleSubmit = async (data) => {
    try {
      if (selectedSiswa) {
        await axios.put(`${API_URL}/siswa/${selectedSiswa.SISWA_ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast("00", "Data siswa berhasil diperbarui");
      } else {
        await axios.post(`${API_URL}/auth/register-siswa`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast("00", "Siswa baru berhasil ditambahkan");
      }
      fetchData(token);
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

  // 🔹 Kolom tabel (gunakan komponen tabel siswa yang sudah ada)
  const columns = [
    { field: "SISWA_ID", header: "ID" },
    { field: "NIS", header: "NIS" },
    { field: "NISN", header: "NISN" },
    { field: "NAMA", header: "Nama" },
    {
      field: "GENDER",
      header: "Jenis Kelamin",
      body: (row) => (row.GENDER === "L" ? "Laki-laki" : "Perempuan"),
    },
    {
      field: "TGL_LAHIR",
      header: "Tanggal Lahir",
      body: (row) =>
        row.TGL_LAHIR
          ? new Date(row.TGL_LAHIR).toLocaleDateString("id-ID")
          : "-",
    },
    { field: "EMAIL", header: "Email" },
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
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Siswa</h3>

      {/* 🔹 Filter tanggal & Toolbar atas */}
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

      {/* Form Siswa */}
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

      {/* 🔹 Dialog Print Margin */}
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
