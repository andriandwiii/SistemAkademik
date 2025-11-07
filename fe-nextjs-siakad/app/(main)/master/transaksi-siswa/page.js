"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormTransaksi from "./components/FormTransaksi";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic import PDFViewer
const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function TransaksiSiswaPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [transaksi, setTransaksi] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState(null);

  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  // Print
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
      fetchTransaksi(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchTransaksi = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-siswa`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];

        // Build filter options
        const tingkatanSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();
        const tahunSet = new Set();

        data.forEach((item) => {
          if (item.tingkatan?.TINGKATAN) tingkatanSet.add(item.tingkatan.TINGKATAN);
          if (item.jurusan?.NAMA_JURUSAN) jurusanSet.add(item.jurusan.NAMA_JURUSAN);
          if (item.kelas?.KELAS_ID) kelasSet.add(item.kelas.KELAS_ID);
          if (item.tahun_ajaran?.NAMA_TAHUN_AJARAN)
            tahunSet.add(item.tahun_ajaran.NAMA_TAHUN_AJARAN);
        });

        setTransaksi(data);
        setOriginalData(data);
        setTingkatanOptions(Array.from(tingkatanSet).map((t) => ({ label: t, value: t })));
        setJurusanOptions(Array.from(jurusanSet).map((j) => ({ label: j, value: j })));
        setKelasOptions(Array.from(kelasSet).map((k) => ({ label: k, value: k })));
        setTahunAjaranOptions(Array.from(tahunSet).map((y) => ({ label: y, value: y })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data transaksi siswa");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data transaksi siswa");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setTransaksi(originalData);
    } else {
      const filtered = originalData.filter(
        (t) =>
          t.siswa?.NAMA?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.siswa?.NIS?.toLowerCase().includes(keyword.toLowerCase())
      );
      setTransaksi(filtered);
    }
  };

  const applyFiltersWithValue = (tingkatan, jurusan, kelas, tahun) => {
    let filtered = [...originalData];

    if (tingkatan) filtered = filtered.filter((t) => t.tingkatan?.TINGKATAN === tingkatan);
    if (jurusan) filtered = filtered.filter((t) => t.jurusan?.NAMA_JURUSAN === jurusan);
    if (kelas) filtered = filtered.filter((t) => t.kelas?.KELAS_ID === kelas);
    if (tahun) filtered = filtered.filter((t) => t.tahun_ajaran?.NAMA_TAHUN_AJARAN === tahun);

    setTransaksi(filtered);
  };

  const resetFilter = () => {
    setTingkatanFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setTahunAjaranFilter(null);
    setTransaksi(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTransaksi) {
        // Edit
        const res = await axios.put(
          `${API_URL}/transaksi-siswa/${selectedTransaksi.ID}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toastRef.current?.showToast(
          res.data.status === "00" ? "00" : "01",
          res.data.message || "Perbarui transaksi siswa"
        );
      } else {
        // Add
        const res = await axios.post(`${API_URL}/transaksi-siswa`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast(
          res.data.status === "00" ? "00" : "01",
          res.data.message || "Tambah transaksi siswa"
        );
      }

      if (isMounted.current) {
        await fetchTransaksi(token);
        setDialogVisible(false);
        setSelectedTransaksi(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan transaksi siswa");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus transaksi siswa "${rowData.siswa?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/transaksi-siswa/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Transaksi siswa berhasil dihapus");
          await fetchTransaksi(token);
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus transaksi siswa");
        }
      },
    });
  };

  const transaksiColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    { field: "TRANSAKSI_ID", header: "ID Transaksi", style: { minWidth: "140px" } },
    {
      field: "siswa.NAMA",
      header: "Nama Siswa",
      style: { minWidth: "180px" },
      body: (row) => row.siswa?.NAMA || "-",
    },
    {
      field: "siswa.NIS",
      header: "NIS",
      style: { minWidth: "140px" },
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
              setDialogVisible(true);
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
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Transaksi Siswa</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <Dropdown
            id="tingkatan-filter"
            value={tingkatanFilter}
            options={tingkatanOptions}
            onChange={(e) => {
              setTingkatanFilter(e.value);
              applyFiltersWithValue(e.value, jurusanFilter, kelasFilter, tahunAjaranFilter);
            }}
            placeholder="Tingkatan"
            className="w-48"
            showClear
          />
          <Dropdown
            id="jurusan-filter"
            value={jurusanFilter}
            options={jurusanOptions}
            onChange={(e) => {
              setJurusanFilter(e.value);
              applyFiltersWithValue(tingkatanFilter, e.value, kelasFilter, tahunAjaranFilter);
            }}
            placeholder="Jurusan"
            className="w-52"
            showClear
          />
          <Dropdown
            id="kelas-filter"
            value={kelasFilter}
            options={kelasOptions}
            onChange={(e) => {
              setKelasFilter(e.value);
              applyFiltersWithValue(tingkatanFilter, jurusanFilter, e.value, tahunAjaranFilter);
            }}
            placeholder="Kelas"
            className="w-48"
            showClear
          />
          <Dropdown
            id="tahun-filter"
            value={tahunAjaranFilter}
            options={tahunAjaranOptions}
            onChange={(e) => {
              setTahunAjaranFilter(e.value);
              applyFiltersWithValue(tingkatanFilter, jurusanFilter, kelasFilter, e.value);
            }}
            placeholder="Tahun Ajaran"
            className="w-56"
            showClear
          />
          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-2"
            tooltip="Reset Filter"
            onClick={resetFilter}
          />
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Laporan"
            onClick={() => setAdjustDialog(true)}
            disabled={transaksi.length === 0}
          />
          <HeaderBar
            title=""
            placeholder="Cari siswa (Nama, NIS)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedTransaksi(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      <CustomDataTable data={transaksi} loading={isLoading} columns={transaksiColumns} />

      {/* FORM */}
      <FormTransaksi
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        selectedTransaksi={selectedTransaksi}
        onSave={handleSubmit}
        token={token}
        transaksiList={transaksi}
      />

      {/* PRINT DIALOG */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTransaksi={transaksi}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* PDF PREVIEW */}
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
