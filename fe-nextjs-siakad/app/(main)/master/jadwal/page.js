"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormJadwal from "./components/FormJadwal";
import DialogSiswaKelas from "./components/DialogSiswaKelas";
import AdjustPrintMarginAbsensi from "./print//AdjustPrintMarginAbsensi";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function JadwalPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [jadwal, setJadwal] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Dialog Siswa
  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

  // Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [selectedJadwalForPrint, setSelectedJadwalForPrint] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // Filter
  const [hariFilter, setHariFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchJadwal(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchJadwal = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.ID - b.ID);
        
        // Build filter options
        const hariSet = new Set();
        const tingkatanSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();

        data.forEach((j) => {
          if (j.hari?.HARI) hariSet.add(j.hari.HARI);
          if (j.tingkatan?.TINGKATAN) tingkatanSet.add(j.tingkatan.TINGKATAN);
          if (j.jurusan?.NAMA_JURUSAN) jurusanSet.add(j.jurusan.NAMA_JURUSAN);
          if (j.kelas?.KELAS_ID) kelasSet.add(j.kelas.KELAS_ID);
        });

        setJadwal(data);
        setOriginalData(data);
        setHariOptions(
          Array.from(hariSet).map((h) => ({ label: h, value: h }))
        );
        setTingkatanOptions(
          Array.from(tingkatanSet).map((t) => ({ label: t, value: t }))
        );
        setJurusanOptions(
          Array.from(jurusanSet).map((j) => ({ label: j, value: j }))
        );
        setKelasOptions(
          Array.from(kelasSet).map((k) => ({ label: k, value: k }))
        );
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data jadwal");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jadwal");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setJadwal(originalData);
    } else {
      const filtered = originalData.filter(
        (j) =>
          j.guru?.NAMA_GURU?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.guru?.NIP?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.mata_pelajaran?.NAMA_MAPEL?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.KODE_JADWAL?.toLowerCase().includes(keyword.toLowerCase())
      );
      setJadwal(filtered);
    }
  };

  // Apply all filters with values
  const applyFiltersWithValue = (hari, tingkatan, jurusan, kelas) => {
    let filtered = [...originalData];

    if (hari) {
      filtered = filtered.filter((j) => j.hari?.HARI === hari);
    }

    if (tingkatan) {
      filtered = filtered.filter((j) => j.tingkatan?.TINGKATAN === tingkatan);
    }

    if (jurusan) {
      filtered = filtered.filter((j) => j.jurusan?.NAMA_JURUSAN === jurusan);
    }

    if (kelas) {
      filtered = filtered.filter((j) => j.kelas?.KELAS_ID === kelas);
    }

    setJadwal(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setHariFilter(null);
    setTingkatanFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setJadwal(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedJadwal) {
        const res = await axios.put(
          `${API_URL}/jadwal/${selectedJadwal.ID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Jadwal berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui jadwal");
          return;
        }
      } else {
        const res = await axios.post(
          `${API_URL}/jadwal`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Jadwal berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan jadwal");
          return;
        }
      }

      if (isMounted.current) {
        await fetchJadwal(token);
        setDialogVisible(false);
        setSelectedJadwal(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan jadwal");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus jadwal "${rowData.KODE_JADWAL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/jadwal/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Jadwal berhasil dihapus");
          if (isMounted.current) await fetchJadwal(token);
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus jadwal");
        }
      },
    });
  };

  const handleViewSiswa = (rowData) => {
    setSelectedJadwalForSiswa(rowData);
    setSiswaDialogVisible(true);
  };

  const handlePrintAbsensi = (rowData) => {
    setSelectedJadwalForPrint(rowData);
    setAdjustDialog(true);
  };

  const jadwalColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    {
      field: "KODE_JADWAL",
      header: "Kode Jadwal",
      style: { minWidth: "120px" },
    },
    {
      field: "hari.HARI",
      header: "Hari",
      style: { minWidth: "100px" },
      body: (row) => row.hari?.HARI || "-",
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
      style: { minWidth: "100px" },
      body: (row) => row.kelas?.KELAS_ID || "-",
    },
    {
      field: "guru.NAMA_GURU",
      header: "Guru",
      style: { minWidth: "180px" },
      body: (row) => row.guru?.NAMA_GURU || "-",
    },
    {
      field: "mata_pelajaran.NAMA_MAPEL",
      header: "Mata Pelajaran",
      style: { minWidth: "150px" },
      body: (row) => row.mata_pelajaran?.NAMA_MAPEL || "-",
    },
    {
      field: "jam_pelajaran.JP_KE",
      header: "Jam Ke",
      style: { minWidth: "80px", textAlign: "center" },
      body: (row) => row.jam_pelajaran?.JP_KE || "-",
    },
    {
      field: "jam_pelajaran",
      header: "Waktu",
      style: { minWidth: "140px" },
      body: (row) => 
        row.jam_pelajaran?.WAKTU_MULAI && row.jam_pelajaran?.WAKTU_SELESAI
          ? `${row.jam_pelajaran.WAKTU_MULAI} - ${row.jam_pelajaran.WAKTU_SELESAI}`
          : "-",
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-print"
            size="small"
            severity="success"
            tooltip="Print Daftar Hadir"
            tooltipOptions={{ position: "top" }}
            onClick={() => handlePrintAbsensi(rowData)}
          />
          <Button
            icon="pi pi-users"
            size="small"
            severity="info"
            tooltip="Lihat Siswa"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleViewSiswa(rowData)}
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedJadwal(rowData);
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
      style: { width: "200px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Jadwal Pelajaran</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="hari-filter" className="text-sm font-medium">
              Hari
            </label>
            <Dropdown
              id="hari-filter"
              value={hariFilter}
              options={hariOptions}
              onChange={(e) => {
                setHariFilter(e.value);
                applyFiltersWithValue(e.value, tingkatanFilter, jurusanFilter, kelasFilter);
              }}
              placeholder="Pilih hari"
              className="w-40"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="tingkatan-filter" className="text-sm font-medium">
              Tingkatan
            </label>
            <Dropdown
              id="tingkatan-filter"
              value={tingkatanFilter}
              options={tingkatanOptions}
              onChange={(e) => {
                setTingkatanFilter(e.value);
                applyFiltersWithValue(hariFilter, e.value, jurusanFilter, kelasFilter);
              }}
              placeholder="Pilih tingkatan"
              className="w-40"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="jurusan-filter" className="text-sm font-medium">
              Jurusan
            </label>
            <Dropdown
              id="jurusan-filter"
              value={jurusanFilter}
              options={jurusanOptions}
              onChange={(e) => {
                setJurusanFilter(e.value);
                applyFiltersWithValue(hariFilter, tingkatanFilter, e.value, kelasFilter);
              }}
              placeholder="Pilih jurusan"
              className="w-48"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="kelas-filter" className="text-sm font-medium">
              Kelas
            </label>
            <Dropdown
              id="kelas-filter"
              value={kelasFilter}
              options={kelasOptions}
              onChange={(e) => {
                setKelasFilter(e.value);
                applyFiltersWithValue(hariFilter, tingkatanFilter, jurusanFilter, e.value);
              }}
              placeholder="Pilih kelas"
              className="w-40"
              showClear
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-3"
            tooltip="Reset Filter"
            onClick={resetFilter}
          />
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-end gap-2">
          <HeaderBar
            title=""
            placeholder="Cari jadwal (Kode, Guru, Mapel)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedJadwal(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable
        data={jadwal}
        loading={isLoading}
        columns={jadwalColumns}
      />

      {/* Form Jadwal */}
      <FormJadwal
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedJadwal(null);
        }}
        selectedJadwal={selectedJadwal}
        onSave={handleSubmit}
        token={token}
        jadwalList={originalData}
      />

      {/* Dialog Siswa Kelas */}
      <DialogSiswaKelas
        visible={siswaDialogVisible}
        onHide={() => {
          setSiswaDialogVisible(false);
          setSelectedJadwalForSiswa(null);
        }}
        jadwalData={selectedJadwalForSiswa}
        token={token}
      />

      {/* Dialog Print Pengaturan */}
      <AdjustPrintMarginAbsensi
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        jadwalData={selectedJadwalForPrint}
        token={token}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* Dialog PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header={`Preview - ${fileName}`}
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}