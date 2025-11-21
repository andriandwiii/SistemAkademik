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
import FormPredikat from "./components/FormPredikat";
import AdjustPrintMarginLaporanPredikat from "./print/AdjustPrintMarginLaporanPredikat";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const [token, setToken] = useState("");
  const [predikatList, setPredikatList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPredikat, setSelectedPredikat] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const [tingkatFilter, setTingkatFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [mapelFilter, setMapelFilter] = useState(null);

  const [tingkatOptions, setTingkatOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);

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
  }, []);

  const fetchPredikat = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-predikat`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];

        data.sort((a, b) => a.ID - b.ID);

        const tingkatSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();
        const mapelSet = new Set();

        data.forEach((item) => {
          if (item.tingkatan?.TINGKATAN) tingkatSet.add(item.tingkatan.TINGKATAN);
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

  const applyFiltersWithValue = (tingkat, jurusan, kelas, mapel) => {
    let filtered = [...originalData];

    if (tingkat) filtered = filtered.filter((item) => item.tingkatan?.TINGKATAN === tingkat);
    if (jurusan) filtered = filtered.filter((item) => item.target?.NAMA_JURUSAN === jurusan);
    if (kelas) filtered = filtered.filter((item) => item.target?.KELAS_ID === kelas);
    if (mapel) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapel);

    setPredikatList(filtered);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(tingkatFilter, jurusanFilter, kelasFilter, mapelFilter);
      return;
    }

    const lower = keyword.toLowerCase();
    let filtered = [...originalData];

    if (tingkatFilter) filtered = filtered.filter((item) => item.tingkatan?.TINGKATAN === tingkatFilter);
    if (jurusanFilter) filtered = filtered.filter((item) => item.target?.NAMA_JURUSAN === jurusanFilter);
    if (kelasFilter) filtered = filtered.filter((item) => item.target?.KELAS_ID === kelasFilter);
    if (mapelFilter) filtered = filtered.filter((item) => item.mapel?.NAMA_MAPEL === mapelFilter);

    filtered = filtered.filter((item) => {
      const mapel = item.mapel?.NAMA_MAPEL?.toLowerCase() || "";
      const kode = item.mapel?.KODE_MAPEL?.toLowerCase() || "";
      const jurusan = item.target?.NAMA_JURUSAN?.toLowerCase() || "";
      const kelas = item.target?.KELAS_ID?.toLowerCase() || "";
      const tingkat = item.tingkatan?.TINGKATAN?.toLowerCase() || "";

      return (
        mapel.includes(lower) ||
        kode.includes(lower) ||
        jurusan.includes(lower) ||
        kelas.includes(lower) ||
        tingkat.includes(lower)
      );
    });

    setPredikatList(filtered);
  };

  const resetFilter = () => {
    setTingkatFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setMapelFilter(null);
    setPredikatList(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedPredikat) {
        const res = await axios.put(`${API_URL}/master-predikat/${selectedPredikat.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status !== "00") {
          toastRef.current?.showToast("01", res.data.message || "Gagal update");
          return;
        }

        toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        const res = await axios.post(`${API_URL}/master-predikat`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status !== "00") {
          toastRef.current?.showToast("01", res.data.message || "Gagal tambah");
          return;
        }

        toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }

      await fetchPredikat(token);
      setDialogVisible(false);
      setSelectedPredikat(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
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
          await fetchPredikat(token);
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => setPdfUrl(""), 300);
  };

  const predikatColumns = [
    { field: "ID", header: "ID", style: { width: "50px", textAlign: "center" }, body: (r) => r.ID },
    {
      field: "KODE_MAPEL",
      header: "Kode",
      body: (r) => <span className="font-medium">{r.mapel?.KODE_MAPEL}</span>,
    },
    {
      field: "NAMA_MAPEL",
      header: "Mata Pelajaran",
      body: (r) => <span className="font-bold">{r.mapel?.NAMA_MAPEL}</span>,
    },
    {
      field: "TINGKAT",
      header: "Tingkat",
      style: { minWidth: "60px", textAlign: "center" },
      body: (r) => r.target?.TINGKATAN || "-",
    },
    {
      field: "JURUSAN",
      header: "Jurusan",
      body: (r) => r.target?.NAMA_JURUSAN || <span className="text-gray-500 italic">Umum</span>,
    },
    {
      field: "KELAS",
      header: "Kelas",
      body: (r) =>
        r.target?.KELAS_ID ? (
          <span className="text-sm font-medium">{r.target.KELAS_ID}</span>
        ) : (
          <span className="text-gray-400 text-xs italic">Semua</span>
        ),
    },
    {
      field: "A",
      header: "Predikat A",
      body: (r) => <div className="line-clamp-3">{r.deskripsi?.A}</div>,
    },
    {
      field: "B",
      header: "Predikat B",
      body: (r) => <div className="line-clamp-3">{r.deskripsi?.B}</div>,
    },
    {
      field: "C",
      header: "Predikat C",
      body: (r) => <div className="line-clamp-3">{r.deskripsi?.C}</div>,
    },
    {
      field: "D",
      header: "Predikat D",
      body: (r) => <div className="line-clamp-3">{r.deskripsi?.D}</div>,
    },
    {
      header: "Aksi",
      style: { width: "100px", textAlign: "center" },
      body: (rowData) => (
        <div className="flex gap-2 justify-content-center">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedPredikat(rowData);
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
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Predikat</h3>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-3">
          
          {/* Tingkatan */}
          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium">Tingkatan</label>
            <Dropdown
              value={tingkatFilter}
              options={tingkatOptions}
              onChange={(e) => {
                setTingkatFilter(e.value);
                applyFiltersWithValue(e.value, jurusanFilter, kelasFilter, mapelFilter);
              }}
              placeholder="Pilih Tingkat"
              className="w-32"
              showClear
            />
          </div>

          {/* Jurusan */}
          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium">Jurusan</label>
            <Dropdown
              value={jurusanFilter}
              options={jurusanOptions}
              onChange={(e) => {
                setJurusanFilter(e.value);
                applyFiltersWithValue(tingkatFilter, e.value, kelasFilter, mapelFilter);
              }}
              placeholder="Pilih Jurusan"
              className="w-40"
              showClear
            />
          </div>

          {/* Kelas */}
          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium">Kelas</label>
            <Dropdown
              value={kelasFilter}
              options={kelasOptions}
              onChange={(e) => {
                setKelasFilter(e.value);
                applyFiltersWithValue(tingkatFilter, jurusanFilter, e.value, mapelFilter);
              }}
              placeholder="Pilih Kelas"
              className="w-32"
              showClear
            />
          </div>

          {/* Mapel */}
          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium">Mata Pelajaran</label>
            <Dropdown
              value={mapelFilter}
              options={mapelOptions}
              onChange={(e) => {
                setMapelFilter(e.value);
                applyFiltersWithValue(tingkatFilter, jurusanFilter, kelasFilter, e.value);
              }}
              placeholder="Pilih Mapel"
              className="w-48"
              showClear
              filter
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-4"
            onClick={resetFilter}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning"
            tooltip="Cetak Laporan"
            onClick={() => setAdjustDialog(true)}
            disabled={predikatList.length === 0 || isLoading}
          />

          <HeaderBar
            placeholder="Cari predikat..."
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedPredikat(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      <CustomDataTable data={predikatList} loading={isLoading} columns={predikatColumns} />

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
        header={<div className="flex items-center gap-2"><i className="pi pi-file-pdf" /> Preview - {fileName}</div>}
        contentStyle={{ height: "calc(90vh - 60px)", padding: 0 }}
      >
        {pdfUrl && (
          <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
        )}
      </Dialog>
    </div>
  );
}
