"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import dynamic from "next/dynamic";

import CustomDataTable from "../../../components/DataTable";
import ToastNotifier from "../../../components/ToastNotifier";
import FormMapel from "./components/formDialogMapel";
import AdjustPrintMarginLaporanMapel from "./print/AdjustPrintMarginLaporanMapel";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

export default function MasterMapelPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [mapelList, setMapelList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);

  // 🔹 Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // 🔹 Searching
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchMapel();
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchMapel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`);
      const json = await res.json();
      if (!isMounted.current) return;
      const sorted = json.data?.sort((a, b) => b.ID - a.ID) || [];
      setMapelList(sorted);
      setOriginalData(sorted);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data mata pelajaran");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // ✅ Fungsi simpan dengan validasi field wajib
  const handleSave = async (data) => {
    // Pastikan field sesuai struktur form
    if (
      !data.KODE_MAPEL ||
      !data.NAMA_MAPEL ||
      !data.KATEGORI ||
      !data.DESKRIPSI ||
      !data.STATUS ||
      data.KODE_MAPEL.trim() === "" ||
      data.NAMA_MAPEL.trim() === "" ||
      data.KATEGORI.trim() === "" ||
      data.DESKRIPSI.trim() === "" ||
      data.STATUS.trim() === ""
    ) {
      toastRef.current?.showToast("01", "Harap isi semua field sebelum menyimpan");
      return;
    }

    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-mata-pelajaran`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Mata pelajaran berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedMapel) {
        await fetch(`${API_URL}/master-mata-pelajaran/${selectedMapel.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Mata pelajaran berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchMapel();
        setDialogMode(null);
        setSelectedMapel(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan mata pelajaran");
    }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus mata pelajaran "${row.NAMA_MAPEL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await fetch(`${API_URL}/master-mata-pelajaran/${row.ID}`, { method: "DELETE" });
          toastRef.current?.showToast("00", "Mata pelajaran berhasil dihapus");
          if (isMounted.current) await fetchMapel();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus mata pelajaran");
        }
      },
      rejectLabel: "Batal",
      acceptLabel: "Hapus",
      acceptClassName: "p-button-danger",
    });
  };

  // 🔍 Fungsi Search
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      setMapelList(originalData);
    } else {
      const filtered = originalData.filter(
        (m) =>
          m.NAMA_MAPEL.toLowerCase().includes(keyword.toLowerCase()) ||
          m.KODE_MAPEL.toLowerCase().includes(keyword.toLowerCase()) ||
          m.KATEGORI.toLowerCase().includes(keyword.toLowerCase())
      );
      setMapelList(filtered);
    }
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setSelectedMapel(row);
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
  );

  const columns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    { field: "KODE_MAPEL", header: "Kode Mapel" },
    { field: "NAMA_MAPEL", header: "Nama Mapel" },
    { field: "KATEGORI", header: "Kategori" },
    { field: "DESKRIPSI", header: "Deskripsi" },
    { field: "STATUS", header: "Status" },
    { header: "Actions", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Master Mata Pelajaran</h3>

      {/* 🔹 BARIS UTAMA: Print | Search | Tambah Mapel */}
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
            placeholder="Cari mapel..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Mapel"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedMapel(null);
          }}
        />
      </div>

      <CustomDataTable data={mapelList} loading={loading} columns={columns} />

      <ConfirmDialog />

      <FormMapel
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedMapel(null);
        }}
        selectedMapel={selectedMapel}
        onSave={handleSave}
      />

      {/* 🔹 Komponen Print & Preview PDF */}
      <AdjustPrintMarginLaporanMapel
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataMapel={mapelList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Mapel"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
