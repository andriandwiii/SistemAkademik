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
import CustomDataTable from "../../../components/DataTable";
import FormTransaksiKKM from "./components/FormTransaksiKKM"; 
import AdjustPrintMarginLaporanTransaksiKKM from "./print/AdjustPrintMarginLaporanTransaksiKKM";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic Import PDF Viewer
const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function MasterTransaksiKKMPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  // --- STATE DATA ---
  const [token, setToken] = useState("");
  const [kkmList, setKkmList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
      fetchDataKKM(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FETCH DATA ---
  const fetchDataKKM = async (t) => {
    setIsLoading(true);
    try {
      // Pastikan endpoint ini sesuai dengan backend Anda
      const res = await axios.get(`${API_URL}/transaksi-kkm`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        
        // Sorting berdasarkan ID Descending (Terbaru diatas)
        data.sort((a, b) => b.ID - a.ID); 

        // --- Build Filter Options ---
        // Kita sesuaikan akses properti dengan struktur Model Backend baru
        const tingkatSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();
        const mapelSet = new Set();

        data.forEach((item) => {
          // FIX: Akses ke properti tingkatan, jurusan, kelas (bukan target)
          if (item.tingkatan?.TINGKATAN) tingkatSet.add(item.tingkatan.TINGKATAN);
          if (item.jurusan?.NAMA_JURUSAN) jurusanSet.add(item.jurusan.NAMA_JURUSAN);
          if (item.kelas?.KELAS_ID) kelasSet.add(item.kelas.KELAS_ID);
          if (item.mapel?.NAMA_MAPEL) mapelSet.add(item.mapel.NAMA_MAPEL);
        });

        setKkmList(data);
        setOriginalData(data);
        
        setTingkatOptions(Array.from(tingkatSet).map((s) => ({ label: s, value: s })));
        setJurusanOptions(Array.from(jurusanSet).map((s) => ({ label: s, value: s })));
        setKelasOptions(Array.from(kelasSet).map((s) => ({ label: s, value: s })));
        setMapelOptions(Array.from(mapelSet).map((m) => ({ label: m, value: m })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data KKM");
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

      // Filter Dropdown
      // FIX: Sesuaikan path object (tingkatan, jurusan, kelas)
      if (tingkatFilter) filtered = filtered.filter((item) => item.tingkatan?.TINGKATAN === tingkatFilter);
      if (jurusanFilter) filtered = filtered.filter((item) => item.jurusan?.NAMA_JURUSAN === jurusanFilter);
      if (kelasFilter) filtered = filtered.filter((item) => item.kelas?.KELAS_ID === kelasFilter);
      if (mapelFilter) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapelFilter);

      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((item) => {
        const mapelName = item.mapel?.NAMA_MAPEL?.toLowerCase() || "";
        const kodeMapel = item.mapel?.KODE_MAPEL?.toLowerCase() || "";
        const jurusan = item.jurusan?.NAMA_JURUSAN?.toLowerCase() || "";
        const kelas = item.kelas?.KELAS_ID?.toLowerCase() || "";
        
        return (
          mapelName.includes(lowerKeyword) ||
          kodeMapel.includes(lowerKeyword) ||
          jurusan.includes(lowerKeyword) ||
          kelas.includes(lowerKeyword)
        );
      });

      setKkmList(filtered);
    }
  };

  const applyFiltersWithValue = (tingkat, jurusan, kelas, mapel) => {
    let filtered = [...originalData];

    if (tingkat) filtered = filtered.filter((item) => item.tingkatan?.TINGKATAN === tingkat);
    if (jurusan) filtered = filtered.filter((item) => item.jurusan?.NAMA_JURUSAN === jurusan);
    if (kelas) filtered = filtered.filter((item) => item.kelas?.KELAS_ID === kelas);
    if (mapel) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapel);

    setKkmList(filtered);
  };

  const resetFilter = () => {
    setTingkatFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setMapelFilter(null);
    setKkmList(originalData);
  };

  // --- 4. CRUD ACTIONS ---
  const handleSubmit = async (data) => {
    try {
      if (selectedItem) {
        // UPDATE
        const res = await axios.put(
          `${API_URL}/transaksi-kkm/${selectedItem.ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data KKM berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal update");
          return;
        }
      } else {
        // CREATE
        const res = await axios.post(`${API_URL}/transaksi-kkm`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data KKM berhasil ditambahkan");
        } else {
          // Handle error jika mapel belum punya master KKM
          toastRef.current?.showToast("01", res.data.message || "Gagal tambah");
          return;
        }
      }

      if (isMounted.current) {
        await fetchDataKKM(token);
        setDialogVisible(false);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal menyimpan data (Pastikan Master KKM untuk Mapel ini ada)";
      toastRef.current?.showToast("01", msg);
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: (
        <div className="text-sm">
          Yakin hapus KKM untuk mapel <b>{rowData.mapel?.NAMA_MAPEL}</b>?
          <br />
          <span className="text-red-500">Data yang dihapus tidak dapat dikembalikan.</span>
        </div>
      ),
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger p-button-sm",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/transaksi-kkm/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          if (isMounted.current) {
            await fetchDataKKM(token);
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

  // --- 6. TABLE COLUMNS (FIX: Struktur data & Styling Polos) ---
  const kkmColumns = [
    { 
      field: "ID", 
      header: "ID", 
      style: { width: "50px", textAlign: "center" },
      body: (row) => <span className="text-sm">{row.ID}</span>
    },
    {
        field: "TAHUN_AJARAN",
        header: "Tahun Ajaran",
        style: { minWidth: "120px" },
        // Mengambil dari object tahun_ajaran
        body: (row) => <span className="text-sm">{row.tahun_ajaran?.TAHUN_AJARAN_ID || "-"}</span>
    },
    // --- KOLOM KODE MAPEL (DIPISAH) ---
    {
      field: "KODE_MAPEL",
      header: "Kode Mapel",
      style: { minWidth: "100px" },
      body: (row) => <span className="text-sm font-medium text-gray-700">{row.mapel?.KODE_MAPEL || "-"}</span>
    },
    // --- KOLOM NAMA MAPEL (DIPISAH) ---
    {
      field: "NAMA_MAPEL",
      header: "Nama Mata Pelajaran",
      style: { minWidth: "200px" },
      body: (row) => <span className="text-sm">{row.mapel?.NAMA_MAPEL || "-"}</span>
    },
    // --- KOLOM TINGKATAN (FIX PATH) ---
    {
      field: "TINGKATAN",
      header: "Tingkat",
      style: { minWidth: "80px", textAlign: "center" },
      // Menggunakan row.tingkatan.TINGKATAN
      body: (row) => <span className="text-sm">{row.tingkatan?.TINGKATAN || "-"}</span>
    },
    // --- KOLOM JURUSAN (FIX PATH) ---
    {
      field: "JURUSAN",
      header: "Jurusan",
      style: { minWidth: "150px" },
      // Menggunakan row.jurusan.NAMA_JURUSAN
      body: (row) => <span className="text-sm">{row.jurusan?.NAMA_JURUSAN || "Umum"}</span>
    },
    // --- KOLOM KELAS (FIX PATH) ---
    {
      field: "KELAS",
      header: "Kelas",
      style: { minWidth: "100px", textAlign: "center" },
      // Menggunakan row.kelas.KELAS_ID
      body: (row) => <span className="text-sm">{row.kelas?.KELAS_ID || "Semua"}</span>
    },
    // --- KOLOM NILAI KKM (Polos, Tanpa Warna) ---
    {
      field: "NILAI_KKM",
      header: "Nilai KKM",
      style: { minWidth: "100px", textAlign: "center" },
      body: (row) => {
        // Menggunakan row.kkm.NILAI_KKM
        const nilai = row.kkm?.NILAI_KKM || "-";
        return (
            // Hanya span text biasa, font ukuran sama
            <span className="text-sm font-semibold text-gray-800">
                {nilai}
            </span>
        );
      }
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
              setSelectedItem(rowData);
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
      style: { width: "100px", textAlign: "center" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Transaksi KKM</h3>

      {/* --- FILTER & TOOLBAR SECTION --- */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2 items-end">
          {/* Filter Tingkatan */}
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
              className="w-40 p-inputtext-sm" // input kecil
              showClear
            />
          </div>

          {/* Filter Jurusan */}
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
              className="w-48 p-inputtext-sm"
              showClear
            />
          </div>

          {/* Filter Kelas */}
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
              className="w-40 p-inputtext-sm"
              showClear
            />
          </div>

          {/* Filter Mapel */}
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
              className="w-52 p-inputtext-sm"
              showClear
              filter
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary p-button-sm mt-4"
            tooltip="Reset Filter"
            onClick={resetFilter}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning p-button-sm mt-3"
            tooltip="Cetak Laporan"
            onClick={() => setAdjustDialog(true)}
            disabled={kkmList.length === 0 || isLoading}
          />

          <HeaderBar
            title=""
            placeholder="Cari mapel, jurusan..."
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedItem(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <CustomDataTable 
        data={kkmList} 
        loading={isLoading} 
        columns={kkmColumns} 
      />

      {/* Dialogs */}
      <FormTransaksiKKM
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
        onSave={handleSubmit}
      />

      <AdjustPrintMarginLaporanTransaksiKKM
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTransaksi={kkmList}
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