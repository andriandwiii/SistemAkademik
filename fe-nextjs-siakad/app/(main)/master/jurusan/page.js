'use client'

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormJurusan from "./components/FormJurusan";
import dynamic from "next/dynamic";

// 2. Buat KEDUANYA dinamis dengan SSR: FALSE
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  {
    ssr: false,
  }
);

export default function MasterJurusanPage() {
  const toastRef = useRef(null);
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // 1. PINDAHKAN STATE 'dataAdjust' KE SINI
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: 'A4',
    orientation: 'portrait',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🔹 Ambil token dari localStorage
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchJurusan();
  }, [token]); // Tambahkan token sebagai dependensi

  // 🔹 Fetch data
  const fetchJurusan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-jurusan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setJurusanList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jurusan");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    // Pencarian seharusnya dilakukan di sisi client dari data yang sudah di-fetch
    // Jika ingin search ke DB, harusnya panggil API
    if (!keyword) {
      fetchJurusan(); // Reset jika search kosong
    } else {
      const filtered = jurusanList.filter(
        (j) =>
          j.NAMA_JURUSAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.DESKRIPSI?.toLowerCase().includes(keyword.toLowerCase())
      );
      setJurusanList(filtered); // Ini hanya filter di client
    }
  };


  // 💾 Save handler
  const handleSave = async (data) => {
    setLoading(true); // Tambahkan loading
    try {
      let res;
      if (dialogMode === "add") {
        res = await fetch(`${API_URL}/master-jurusan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jurusan berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/master-jurusan/${selectedItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jurusan berhasil diubah"); // Pesan lebih spesifik
      }
      fetchJurusan();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan saat menyimpan jurusan");
    } finally {
      setLoading(false); // Matikan loading
    }
  };

  // ❌ Delete handler
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus jurusan "${row.NAMA_JURUSAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true); // Tambahkan loading
        try {
          await fetch(`${API_URL}/master-jurusan/${row.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Jurusan berhasil dihapus");
          fetchJurusan();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus jurusan");
        } finally {
          setLoading(false); // Matikan loading
        }
      },
    });
  };

 const columns = [
  { field: "id", header: "ID", style: { width: "60px", textAlign: "center" } },
  { field: "JURUSAN_ID", header: "Kode Jurusan", style: { width: "200px" } },
  { field: "NAMA_JURUSAN", header: "Nama Jurusan", style: { width: "250px" } },
  { field: "DESKRIPSI", header: "Deskripsi", style: { minWidth: "250px" } },
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

      <h3 className="text-xl font-semibold mb-4">Master Jurusan</h3>

      {/* 🔹 Toolbar atas: Print | Search | Tambah */}
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
            placeholder="Cari nama atau deskripsi..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Jurusan"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 Tabel */}
      <CustomDataTable data={jurusanList} loading={loading} columns={columns} />

      {/* 🔹 Form */}
      <FormJurusan
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedJurusan={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Print dialog */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataJurusan={jurusanList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        
        // 3. KIRIM STATE DAN SETTER-NYA SEBAGAI PROPS
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Jurusan"
        blockScroll
      >
        {/* 4. SEKARANG 'dataAdjust' VALID DAN BISA DIGUNAKAN */}
        <PDFViewer 
          pdfUrl={pdfUrl} 
          fileName={fileName} 
        />
      </Dialog>
    </div>
  );
}
