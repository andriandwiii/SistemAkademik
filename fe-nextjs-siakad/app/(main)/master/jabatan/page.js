"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormJabatan from "./components/FormJabatan";
import dynamic from "next/dynamic";

// 🔹 Buat komponen print dinamis tanpa SSR
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterJabatanPage() {
  const toastRef = useRef(null);
  const [jabatanList, setJabatanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🔹 Ambil token dan fetch data
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchJabatan();
  }, [token]);

  // 🔹 Fetch semua data jabatan
  const fetchJabatan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-jabatan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setJabatanList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jabatan");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchJabatan();
    } else {
      const filtered = jabatanList.filter(
        (j) =>
          j.NAMA_JABATAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.KODE_JABATAN?.toLowerCase().includes(keyword.toLowerCase())
      );
      setJabatanList(filtered);
    }
  };

  // 💾 Save handler
  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-jabatan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jabatan berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/master-jabatan/${selectedItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jabatan berhasil diubah");
      }
      fetchJabatan();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan saat menyimpan jabatan");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete handler
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus jabatan "${row.NAMA_JABATAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/master-jabatan/${row.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Jabatan berhasil dihapus");
          fetchJabatan();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus jabatan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🧩 Kolom tabel
  const columns = [
    { field: "id", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "KODE_JABATAN", header: "Kode Jabatan", style: { width: "200px" } },
    { field: "NAMA_JABATAN", header: "Nama Jabatan", style: { width: "250px" } },
    { field: "STATUS", header: "Status", style: { width: "150px" } },
    {
      header: "Actions",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedItem(row);
              setDialogMode("edit");
            }}
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

      <h3 className="text-xl font-semibold mb-4">Master Jabatan</h3>

      {/* 🔹 Toolbar atas */}
      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button
          icon="pi pi-print"
          severity="warning"
          onClick={() => setAdjustDialog(true)}
        />

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari kode atau nama jabatan..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Jabatan"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 DataTable */}
      <CustomDataTable data={jabatanList} loading={loading} columns={columns} />

      {/* 🔹 Form */}
      <FormJabatan
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedJabatan={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Print Dialog */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataJabatan={jabatanList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Jabatan"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
