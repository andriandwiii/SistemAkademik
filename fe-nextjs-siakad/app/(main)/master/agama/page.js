"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormAgama from "./components/FormAgama";
import dynamic from "next/dynamic";

// Komponen cetak dinamis
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterAgamaPage() {
  const toastRef = useRef(null);
  const [agamaList, setAgamaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Cetak / Print
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Load data awal
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchAgama();
  }, [token]);

  // Ambil data
  const fetchAgama = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/agama`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setAgamaList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data agama");
    } finally {
      setLoading(false);
    }
  };

  // Pencarian
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchAgama();
    } else {
      const filtered = agamaList.filter((a) =>
        a.NAMAAGAMA?.toLowerCase().includes(keyword.toLowerCase())
      );
      setAgamaList(filtered);
    }
  };

  // Tambah/Edit
  const handleSave = async (data) => {
    setLoading(true);
    try {
      // === CEK DUPLIKAT DI FRONTEND ===
      const isDuplicate = agamaList.some(
        (a) => a.NAMAAGAMA?.toLowerCase() === data.NAMAAGAMA?.toLowerCase()
      );

      if (dialogMode === "add" && isDuplicate) {
        toastRef.current?.showToast("01", "Nama agama sudah ada!");
        setLoading(false);
        return;
      }

      if (dialogMode === "add") {
        const res = await fetch(`${API_URL}/agama`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        // === CEK DUPLIKAT DARI BACKEND ===
        if (
          json.code === "23505" ||
          json.message?.toLowerCase().includes("duplicate") ||
          json.message?.toLowerCase().includes("sudah ada")
        ) {
          toastRef.current?.showToast("01", "Nama agama sudah ada di database!");
          setLoading(false);
          return;
        }

        toastRef.current?.showToast("00", "Agama berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/agama/${selectedItem.IDAGAMA}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Agama berhasil diperbarui");
      }

      fetchAgama();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan saat menyimpan agama");
    } finally {
      setLoading(false);
    }
  };

  // Hapus
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus agama "${row.NAMAAGAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/agama/${row.IDAGAMA}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Agama berhasil dihapus");
          fetchAgama();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus agama");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Kolom tabel
  const columns = [
    { field: "IDAGAMA", header: "ID", style: { width: "10px", textAlign: "left" } },
    { field: "NAMAAGAMA", header: "Nama Agama", style: { width: "250px" } },
    
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

      <h3 className="text-xl font-semibold mb-4">Master Agama</h3>

      {/* Toolbar atas */}
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
            placeholder="Cari nama agama..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Agama"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* Tabel */}
      <CustomDataTable data={agamaList} loading={loading} columns={columns} />

      {/* Form Tambah/Edit */}
      <FormAgama
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedAgama={selectedItem}
        onSave={handleSave}
      />

      {/* Dialog Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataAgama={agamaList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* Preview PDF */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Agama"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
