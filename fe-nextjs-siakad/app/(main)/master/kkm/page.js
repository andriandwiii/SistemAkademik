"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormKKM from "./components/FormKKM";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporanKKM = dynamic(
  () => import("./print/AdjustPrintMarginLaporanKKM"),
  { ssr: false }
);

export default function MasterKKMPage() {
  const toastRef = useRef(null);
  const [kkmList, setKkmList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchKKM();
  }, [token]);

  const fetchKKM = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-kkm`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setKkmList(json.data);
      } else {
        toastRef.current?.showToast("01", json.message || "Gagal memuat data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) fetchKKM();
    else {
      const filtered = kkmList.filter(
        (item) =>
          item.KODE_KKM?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KODE_MAPEL?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KETERANGAN?.toLowerCase().includes(keyword.toLowerCase())
      );
      setKkmList(filtered);
    }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      const method = dialogMode === "add" ? "POST" : "PUT";
      const url =
        dialogMode === "add"
          ? `${API_URL}/master-kkm`
          : `${API_URL}/master-kkm/${selectedItem?.ID}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toastRef.current?.showToast(
          "00",
          dialogMode === "add"
            ? "Data KKM berhasil ditambahkan"
            : "Data KKM berhasil diperbarui"
        );
        fetchKKM();
        setDialogMode(null);
        setSelectedItem(null);
      } else {
        toastRef.current?.showToast("01", result.message || "Gagal menyimpan data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Kesalahan server saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus data KKM "${row.KODE_KKM}" (${row.NAMA_MAPEL || row.KODE_MAPEL})?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/master-kkm/${row.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            toastRef.current?.showToast("00", "Data KKM berhasil dihapus");
            fetchKKM();
          } else {
            toastRef.current?.showToast("01", "Gagal menghapus data KKM");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Kesalahan koneksi server");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    { field: "KODE_KKM", header: "Kode KKM", style: { width: "120px" } },
    { field: "NAMA_MAPEL", header: "Nama Mapel", style: { width: "220px" } },
    { field: "KOMPLEKSITAS", header: "Kompleksitas", style: { width: "120px" } },
    { field: "DAYA_DUKUNG", header: "Daya Dukung", style: { width: "120px" } },
    { field: "INTAKE", header: "Intake", style: { width: "100px" } },
    { field: "KKM", header: "Nilai KKM", style: { width: "100px" } },
    { field: "STATUS", header: "Status", style: { width: "100px" } },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2 justify-center">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            rounded
            onClick={() => {
              setSelectedItem(row);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            rounded
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: "120px", textAlign: "center" },
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-semibold text-gray-700">
          Master Kriteria Ketuntasan Minimal (KKM)
        </h2>
        <Button
          icon="pi pi-plus"
          label="Tambah KKM"
          severity="info"
          className="font-medium"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* Toolbar Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-print"
            label="Cetak"
            severity="secondary"
            className="font-medium"
            onClick={() => setAdjustDialog(true)}
          />
        </div>

        <div className="flex items-center">
          <span className="p-input-icon-left">
            <i className="pi pi-search text-gray-500" />
            <InputText
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari KKM, mapel, atau keterangan..."
              className="w-72"
            />
          </span>
        </div>
      </div>

      {/* DataTable */}
      <CustomDataTable
        data={kkmList}
        loading={loading}
        columns={columns}
        title="Daftar Data KKM"
      />

      {/* Form Dialog */}
      <FormKKM
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedKKM={selectedItem}
        onSave={handleSave}
        token={token}
      />

      {/* Print Dialog */}
      <AdjustPrintMarginLaporanKKM
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKKM={kkmList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* Preview PDF */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan KKM"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
