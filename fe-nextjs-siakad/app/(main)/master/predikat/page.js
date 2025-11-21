"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

// --- COMPONENTS ---
// Pastikan path import ini sesuai dengan struktur folder proyek Anda

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable"
import FormPredikat from "./components/FormPredikat"; 
import AdjustPrintMarginLaporanPredikat from "./print/AdjustPrintMarginLaporanPredikat";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic Import PDF Viewer
const PDFViewer = dynamic(() => import("../kkm/print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function MasterPredikatPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  // --- STATE DATA ---
  const [token, setToken] = useState("");
  const [predikatList, setPredikatList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPredikat, setSelectedPredikat] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // --- STATE PRINT ---
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // --- STATE FILTER ---
  const [tingkatFilter, setTingkatFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [mapelFilter, setMapelFilter] = useState(null);

  const [tingkatOptions, setTingkatOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchPredikat(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FETCH DATA ---
  const fetchPredikat = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-predikat`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        
        // --- SORTING DARI A KE B (ASCENDING) ---
        data.sort((a, b) => a.ID - b.ID); 

        // --- Build Filter Options ---
        const tingkatSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();
        const mapelSet = new Set();

        data.forEach((item) => {
          if (item.target?.TINGKATAN_ID) tingkatSet.add(item.target.TINGKATAN_ID);
          if (item.target?.NAMA_JURUSAN) jurusanSet.add(item.target.NAMA_JURUSAN);
          if (item.target?.KELAS_ID) kelasSet.add(item.target.KELAS_ID);
          if (item.mapel?.NAMA_MAPEL) mapelSet.add(item.mapel.NAMA_MAPEL);
        });

        setPredikatList(data);
        setOriginalData(data);
        
        setTingkatOptions(Array.from(tingkatSet).map((s) => ({ label: s, value: s })));
        setJurusanOptions(Array.from(jurusanSet).map((s) => ({ label: s, value: s })));
        setKelasOptions(Array.from(kelasSet).map((s) => ({ label: s, value: s })));
        setMapelOptions(Array.from(mapelSet).map((m) => ({ label: m, value: m })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data Predikat");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data Predikat");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- 3. HANDLE SEARCH & FILTER ---
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(tingkatFilter, jurusanFilter, kelasFilter, mapelFilter);
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (tingkatFilter) filtered = filtered.filter((item) => item.target?.TINGKATAN_ID === tingkatFilter);
      if (jurusanFilter) filtered = filtered.filter((item) => item.target?.NAMA_JURUSAN === jurusanFilter);
      if (kelasFilter) filtered = filtered.filter((item) => item.target?.KELAS_ID === kelasFilter);
      if (mapelFilter) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapelFilter);

      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((item) => {
        const mapelName = item.mapel?.NAMA_MAPEL?.toLowerCase() || "";
        const kodeMapel = item.mapel?.KODE_MAPEL?.toLowerCase() || "";
        const jurusan = item.target?.NAMA_JURUSAN?.toLowerCase() || "";
        const kelas = item.target?.KELAS_ID?.toLowerCase() || "";
        
        return (
          mapelName.includes(lowerKeyword) ||
          kodeMapel.includes(lowerKeyword) ||
          jurusan.includes(lowerKeyword) ||
          kelas.includes(lowerKeyword)
        );
      });

      setPredikatList(filtered);
    }
  };

  const applyFiltersWithValue = (tingkat, jurusan, kelas, mapel) => {
    let filtered = [...originalData];

    if (tingkat) filtered = filtered.filter((item) => item.target?.TINGKATAN_ID === tingkat);
    if (jurusan) filtered = filtered.filter((item) => item.target?.NAMA_JURUSAN === jurusan);
    if (kelas) filtered = filtered.filter((item) => item.target?.KELAS_ID === kelas);
    if (mapel) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapel);

    setPredikatList(filtered);
  };

  const resetFilter = () => {
    setTingkatFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setMapelFilter(null);
    setPredikatList(originalData);
  };

  // --- 4. CRUD ACTIONS ---
  const handleSubmit = async (data) => {
    try {
      if (selectedPredikat) {
        // UPDATE
        const res = await axios.put(
          `${API_URL}/master-predikat/${selectedPredikat.ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data Predikat berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal update");
          return;
        }
      } else {
        // CREATE
        const res = await axios.post(`${API_URL}/master-predikat`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data Predikat berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal tambah");
          return;
        }
      }

      if (isMounted.current) {
        await fetchPredikat(token);
        setDialogVisible(false);
        setSelectedPredikat(null);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal menyimpan data";
      toastRef.current?.showToast("01", msg);
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin hapus deskripsi mapel "${rowData.mapel?.NAMA_MAPEL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-predikat/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          if (isMounted.current) {
            await fetchPredikat(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => {
      setPdfUrl("");
    }, 300);
  };

  // --- 6. TABLE COLUMNS ---
  const predikatColumns = [
    { 
      field: "ID", 
      header: "ID", 
      style: { width: "50px", textAlign: "center" },
      body: (row) => row.ID
    },
    {
      field: "KODE_MAPEL",
      header: "Kode",
      style: { minWidth: "100px" },
      body: (row) => <span className="font-medium">{row.mapel?.KODE_MAPEL || "-"}</span>
    },
    {
      field: "NAMA_MAPEL",
      header: "Mata Pelajaran",
      style: { minWidth: "180px" },
      body: (row) => <span className="font-bold text-gray-700">{row.mapel?.NAMA_MAPEL || "-"}</span>
    },
    // --- KOLOM TINGKATAN ---
    {
      field: "TINGKATAN",
      header: "Tingkat",
      style: { minWidth: "80px", textAlign: "center" },
      body: (row) => row.target?.TINGKATAN_ID || "-"
    },
    // --- KOLOM JURUSAN ---
    {
      field: "JURUSAN",
      header: "Jurusan",
      style: { minWidth: "120px" },
      body: (row) => row.target?.NAMA_JURUSAN || <span className="text-gray-500 italic">Umum</span>
    },
    // --- KOLOM KELAS ---
   {
      field: "KELAS",
      header: "Kelas",
      style: { minWidth: "100px", textAlign: "center" },
      body: (row) => (
        row.target?.KELAS_ID ? 
        // Class pewarnaan dihapus, ganti font-medium saja biar rapi
        <span className="text-sm font-medium text-gray-700">
          {row.target.KELAS_ID}
        </span> : 
        <span className="text-gray-400 text-xs italic">Semua</span>
      )
    },
    // --- PREDIKAT A ---
    {
      field: "DESKRIPSI_A",
      header: "Predikat A",
      style: { minWidth: "200px", fontSize: "1.00 rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.A || "-"}</div>
    },
    // --- PREDIKAT B ---
    {
      field: "DESKRIPSI_B",
      header: "Predikat B",
      style: { minWidth: "200px", fontSize: "1.00 rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.B || "-"}</div>
    },
    // --- PREDIKAT C ---
    {
      field: "DESKRIPSI_C",
      header: "Predikat C",
      style: { minWidth: "200px", fontSize: "1.00 rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.C || "-"}</div>
    },
    // --- PREDIKAT D ---
    {
      field: "DESKRIPSI_D",
      header: "Predikat D",
      style: { minWidth: "200px", fontSize: "1.00 rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.D || "-"}</div>
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2 justify-content-center">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedPredikat(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
      style: { width: "100px", textAlign: "center", verticalAlign: "top" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Predikat</h3>

      {/* --- FILTER & TOOLBAR SECTION --- */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="tingkat-filter" className="text-sm font-medium">Tingkatan</label>
            <Dropdown
              id="tingkat-filter"
              value={tingkatFilter}
              options={tingkatOptions}
              onChange={(e) => {
                setTingkatFilter(e.value);
                applyFiltersWithValue(e.value, jurusanFilter, kelasFilter, mapelFilter);
              }}
              placeholder="Pilih Tingkat"
              className="w-40"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="jurusan-filter" className="text-sm font-medium">Jurusan</label>
            <Dropdown
              id="jurusan-filter"
              value={jurusanFilter}
              options={jurusanOptions}
              onChange={(e) => {
                setJurusanFilter(e.value);
                applyFiltersWithValue(tingkatFilter, e.value, kelasFilter, mapelFilter);
              }}
              placeholder="Pilih Jurusan"
              className="w-48"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="kelas-filter" className="text-sm font-medium">Kelas</label>
            <Dropdown
              id="kelas-filter"
              value={kelasFilter}
              options={kelasOptions}
              onChange={(e) => {
                setKelasFilter(e.value);
                applyFiltersWithValue(tingkatFilter, jurusanFilter, e.value, mapelFilter);
              }}
              placeholder="Pilih Kelas"
              className="w-40"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="mapel-filter" className="text-sm font-medium">Mata Pelajaran</label>
            <Dropdown
              id="mapel-filter"
              value={mapelFilter}
              options={mapelOptions}
              onChange={(e) => {
                setMapelFilter(e.value);
                applyFiltersWithValue(tingkatFilter, jurusanFilter, kelasFilter, e.value);
              }}
              placeholder="Pilih Mapel"
              className="w-52"
              showClear
              filter
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-3"
            tooltip="Reset Filter"
            onClick={resetFilter}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Laporan"
            onClick={() => setAdjustDialog(true)}
            disabled={predikatList.length === 0 || isLoading}
          />

          <HeaderBar
            title=""
            placeholder="Cari predikat..."
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedPredikat(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <CustomDataTable 
        data={predikatList} 
        loading={isLoading} 
        columns={predikatColumns} 
      />

      {/* Dialogs */}
      <FormPredikat
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedPredikat(null);
        }}
        selectedItem={selectedPredikat}
        onSave={handleSubmit}
      />

      <AdjustPrintMarginLaporanPredikat
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataPredikat={predikatList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={handleClosePdfPreview}
        modal
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-file-pdf text-red-500"></i>
            <span>Preview - {fileName}</span>
          </div>
        }
        contentStyle={{ height: "calc(90vh - 60px)", padding: 0 }}
      >
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />}
      </Dialog>
    </div>
  );
}