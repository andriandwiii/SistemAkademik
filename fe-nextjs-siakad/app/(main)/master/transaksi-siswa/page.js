"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormTransaksi from "./components/FormTransaksi";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

export default function TransaksiPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (token) fetchTransaksi();
  }, [token]);

  const fetchTransaksi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/transaksi-siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;

      const data = json.data || [];
      console.log("DATA TRANSAKSI:", data); // 🪄 Debug: lihat struktur data dari API

      // Build tingkatan filter options
      const tingkatanSet = new Set();
      data.forEach((t) => {
        const tingkatan = t.tingkatan?.TINGKATAN;
        if (tingkatan) tingkatanSet.add(tingkatan);
      });

      setTransaksi(data);
      setFilteredTransaksi(data);
      setTingkatanOptions(
        Array.from(tingkatanSet).map((t) => ({ label: t, value: t }))
      );
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data transaksi");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // 🔍 Search + Filter
  useEffect(() => {
    let filtered = transaksi;

    if (tingkatanFilter) {
      filtered = filtered.filter(
        (t) => t.tingkatan?.TINGKATAN === tingkatanFilter
      );
    }

    if (searchKeyword.trim() !== "") {
      filtered = filtered.filter(
        (t) =>
          t.siswa?.NAMA?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          t.siswa?.NIS?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    setFilteredTransaksi(filtered);
  }, [tingkatanFilter, searchKeyword, transaksi]);

  const handleSubmit = async (data) => {
    if (!dialogMode) return;
    try {
      if (dialogMode === "add") {
        const res = await fetch(`${API_URL}/transaksi-siswa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const json = await res.json();

        if (res.ok && json.status === "00") {
          toastRef.current?.showToast("00", "Transaksi berhasil ditambahkan");
        } else {
          toastRef.current?.showToast(
            "01",
            json.message || "Gagal menambahkan transaksi"
          );
          return;
        }
      } else if (dialogMode === "edit" && selectedTransaksi) {
        const res = await fetch(
          `${API_URL}/transaksi-siswa/${selectedTransaksi.ID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        const json = await res.json();

        if (res.ok && json.status === "00") {
          toastRef.current?.showToast("00", "Transaksi berhasil diperbarui");
        } else {
          toastRef.current?.showToast(
            "01",
            json.message || "Gagal memperbarui transaksi"
          );
          return;
        }
      }

      if (isMounted.current) {
        await fetchTransaksi();
        setDialogMode(null);
        setSelectedTransaksi(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan transaksi");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus transaksi siswa "${rowData.siswa?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/transaksi-siswa/${rowData.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Transaksi berhasil dihapus");
          if (isMounted.current) await fetchTransaksi();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus transaksi");
        }
      },
    });
  };

  // 🔹 Kolom DataTable
  const transaksiColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    {
      field: "TRANSAKSI_ID",
      header: "ID Transaksi",
      style: { minWidth: "140px" },
    },
    {
      field: "siswa.NAMA",
      header: "Nama Siswa",
      style: { minWidth: "160px" },
      body: (row) => row.siswa?.NAMA || "-",
    },
    {
      field: "siswa.NIS",
      header: "NIS",
      style: { minWidth: "120px" },
      body: (row) => row.siswa?.NIS || "-",
    },
    {
      field: "tingkatan.TINGKATAN",
      header: "Tingkatan",
      style: { minWidth: "100px" },
      body: (row) => row.tingkatan?.TINGKATAN || "-",
    },
    {
      field: "jurusan.NAMA_JURUSAN",
      header: "Jurusan",
      style: { minWidth: "140px" },
      body: (row) => row.jurusan?.NAMA_JURUSAN || "-",
    },
    {
      field: "kelas.KELAS_ID",
      header: "Kelas",
      style: { minWidth: "120px" },
      body: (row) => row.kelas?.KELAS_ID || "-",
    },
    {
      field: "kelas.NAMA_RUANG",
      header: "Nama Ruang",
      style: { minWidth: "120px" },
      body: (row) => row.kelas?.NAMA_RUANG || "-",
    },
    {
      field: "tahun_ajaran.NAMA_TAHUN_AJARAN",
      header: "Tahun Ajaran",
      style: { minWidth: "140px" },
      body: (row) => row.tahun_ajaran?.NAMA_TAHUN_AJARAN || "-",
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedTransaksi(rowData);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(rowData)}
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

      <h3 className="text-xl font-semibold mb-4">Transaksi Penempatan Siswa</h3>

      {/* 🔹 Toolbar atas */}
      <div className="flex flex-col md:flex-row justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div className="flex flex-wrap gap-3 align-items-center w-full md:w-auto">
          <Button
            icon="pi pi-print"
            severity="warning"
            onClick={() => setAdjustDialog(true)}
          />

          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari siswa atau NIS..."
              className="w-64"
            />
          </span>

          <Dropdown
            value={tingkatanFilter}
            options={tingkatanOptions}
            onChange={(e) => setTingkatanFilter(e.value)}
            placeholder="Filter tingkatan"
            className="w-60"
            showClear
          />
        </div>

        <Button
          label="Tambah Transaksi"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedTransaksi(null);
          }}
        />
      </div>

      {/* 🔹 Tabel Data */}
      <CustomDataTable
        data={filteredTransaksi}
        loading={isLoading}
        columns={transaksiColumns}
      />

      {/* 🔹 Form Transaksi */}
      <FormTransaksi
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedTransaksi(null);
        }}
        selectedTransaksi={selectedTransaksi}
        onSave={handleSubmit}
        token={token}
        transaksiList={transaksi}
      />

      {/* 🔹 Dialog Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTransaksi={filteredTransaksi}
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
        header="Preview Laporan Transaksi Siswa"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}
