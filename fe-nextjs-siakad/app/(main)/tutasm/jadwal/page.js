/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import DialogSiswaKelas from "./components/DialogSiswaKelas";
import AdjustPrintMarginAbsensi from "./print/AdjustPrintMarginAbsensi";
import AdjustPrintMarginJadwal from "./print/AdjustPrintMarginJadwal";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function JadwalPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [jadwal, setJadwal] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk menyimpan data Waka Kurikulum
  const [namaKurikulum, setNamaKurikulum] = useState("");
  const [nipKurikulum, setNipKurikulum] = useState("");

  // Dialog Siswa
  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

  // Print Absensi
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [selectedJadwalForPrint, setSelectedJadwalForPrint] = useState(null);
  const [adjustJadwalDialog, setAdjustJadwalDialog] = useState(false);

  // State PDF Preview
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
      fetchDataKurikulum(t);
    }
    return () => { isMounted.current = false; };
  }, []);

  const fetchDataKurikulum = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/users/kurikulum`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (isMounted.current && res.data.status === "00") {
        setNamaKurikulum(res.data.data.name || "Nama Kurikulum Tidak Ditemukan");
        setNipKurikulum(res.data.data.nip || "");
      }
    } catch (err) { console.error(err); }
  };

  const fetchJadwal = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (isMounted.current && res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.ID - b.ID);

        const hariSet = new Set(), tingkatanSet = new Set(), jurusanSet = new Set(), kelasSet = new Set();
        data.forEach((j) => {
          if (j.hari?.HARI) hariSet.add(j.hari.HARI);
          if (j.tingkatan?.TINGKATAN) tingkatanSet.add(j.tingkatan.TINGKATAN);
          if (j.jurusan?.NAMA_JURUSAN) jurusanSet.add(j.jurusan.NAMA_JURUSAN);
          if (j.kelas?.KELAS_ID) kelasSet.add(j.kelas.KELAS_ID);
        });

        setJadwal(data);
        setOriginalData(data);
        setHariOptions(Array.from(hariSet).map(h => ({ label: h, value: h })));
        setTingkatanOptions(Array.from(tingkatanSet).map(t => ({ label: t, value: t })));
        setJurusanOptions(Array.from(jurusanSet).map(j => ({ label: j, value: j })));
        setKelasOptions(Array.from(kelasSet).map(k => ({ label: k, value: k })));
      }
    } catch (err) { console.error(err); }
    finally { if (isMounted.current) setIsLoading(false); }
  };

  const applyFiltersWithValue = (hari, tingkatan, jurusan, kelas) => {
    let filtered = [...originalData];
    if (hari) filtered = filtered.filter(j => (j.HARI || j.hari?.HARI) === hari);
    if (tingkatan) filtered = filtered.filter(j => j.tingkatan?.TINGKATAN === tingkatan);
    if (jurusan) filtered = filtered.filter(j => j.jurusan?.NAMA_JURUSAN === jurusan);
    if (kelas) filtered = filtered.filter(j => (j.kelas?.KELAS_ID || j.KELAS_ID) === kelas);
    setJadwal(filtered);
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(hariFilter, tingkatanFilter, jurusanFilter, kelasFilter);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      const filtered = originalData.filter(j => 
        j.guru?.NAMA_GURU?.toLowerCase().includes(lowerKeyword) ||
        j.mata_pelajaran?.NAMA_MAPEL?.toLowerCase().includes(lowerKeyword) ||
        j.KODE_JADWAL?.toLowerCase().includes(lowerKeyword)
      );
      setJadwal(filtered);
    }
  };

  const resetFilter = () => {
    setHariFilter(null); setTingkatanFilter(null); setJurusanFilter(null); setKelasFilter(null);
    setJadwal(originalData);
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => setPdfUrl(""), 300);
  };

  const jadwalColumns = [
    { field: "KODE_JADWAL", header: "Kode Jadwal" },
    { field: "HARI", header: "Hari", body: (row) => row.HARI || row.hari?.HARI || "-" },
    { field: "TINGKATAN_ID", header: "Tingkatan", body: (row) => row.tingkatan?.TINGKATAN || "-" },
    { field: "JURUSAN_ID", header: "Jurusan", body: (row) => row.jurusan?.NAMA_JURUSAN || "-" },
    { field: "KELAS_ID", header: "Kelas", body: (row) => row.kelas?.KELAS_ID || row.KELAS_ID || "-" },
    { field: "NIP", header: "Guru", body: (row) => row.guru?.NAMA_GURU || "-" },
    { field: "KODE_MAPEL", header: "Mata Pelajaran", body: (row) => row.mata_pelajaran?.NAMA_MAPEL || "-" },
    { field: "KODE_JP", header: "Jam Ke", body: (row) => row.jam_pelajaran?.JP_KE || "-" },
    {
      header: "Waktu",
      body: (row) => row.jam_pelajaran?.WAKTU_MULAI ? `${row.jam_pelajaran.WAKTU_MULAI} - ${row.jam_pelajaran.WAKTU_SELESAI}` : "-"
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button icon="pi pi-print" size="small" severity="success" tooltip="Print Daftar Hadir" onClick={() => { setSelectedJadwalForPrint(rowData); setAdjustDialog(true); }} />
          <Button icon="pi pi-users" size="small" severity="info" tooltip="Lihat Siswa" onClick={() => { setSelectedJadwalForSiswa(rowData); setSiswaDialogVisible(true); }} />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <h3 className="text-xl font-semibold mb-3">Monitoring Jadwal Pelajaran</h3>

      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-end">
          <Dropdown value={hariFilter} options={hariOptions} onChange={(e) => { setHariFilter(e.value); applyFiltersWithValue(e.value, tingkatanFilter, jurusanFilter, kelasFilter); }} placeholder="Hari" className="w-32" showClear />
          <Dropdown value={tingkatanFilter} options={tingkatanOptions} onChange={(e) => { setTingkatanFilter(e.value); applyFiltersWithValue(hariFilter, e.value, jurusanFilter, kelasFilter); }} placeholder="Tingkat" className="w-32" showClear />
          <Dropdown value={jurusanFilter} options={jurusanOptions} onChange={(e) => { setJurusanFilter(e.value); applyFiltersWithValue(hariFilter, tingkatanFilter, e.value, kelasFilter); }} placeholder="Jurusan" className="w-40" showClear />
          <Dropdown value={kelasFilter} options={kelasOptions} onChange={(e) => { setKelasFilter(e.value); applyFiltersWithValue(hariFilter, tingkatanFilter, jurusanFilter, e.value); }} placeholder="Kelas" className="w-32" showClear />
          <Button icon="pi pi-refresh" className="p-button-secondary" onClick={resetFilter} />
        </div>

        <div className="flex items-center gap-2">
          <Button icon="pi pi-print" className="p-button-warning" tooltip="Cetak Laporan Jadwal" onClick={() => setAdjustJadwalDialog(true)} disabled={jadwal.length === 0 || isLoading} />
          {/* onAddClick dikosongkan agar tombol Tambah di HeaderBar tidak muncul/berfungsi */}
          <HeaderBar onSearch={handleSearch} /> 
        </div>
      </div>

      <CustomDataTable data={jadwal} loading={isLoading} columns={jadwalColumns} />

      <DialogSiswaKelas visible={siswaDialogVisible} onHide={() => setSiswaDialogVisible(false)} jadwalData={selectedJadwalForSiswa} token={token} />
      <AdjustPrintMarginAbsensi adjustDialog={adjustDialog} setAdjustDialog={setAdjustDialog} jadwalData={selectedJadwalForPrint} token={token} setPdfUrl={setPdfUrl} setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen} />
      <AdjustPrintMarginJadwal adjustDialog={adjustJadwalDialog} setAdjustDialog={setAdjustJadwalDialog} jadwalToPrint={jadwal} setPdfUrl={setPdfUrl} setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen} namaKurikulum={namaKurikulum} nipKurikulum={nipKurikulum} />

      <Dialog visible={jsPdfPreviewOpen} onHide={handleClosePdfPreview} modal maximizable style={{ width: "90vw", height: "90vh" }} header={`Preview - ${fileName}`}>
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />}
      </Dialog>
    </div>
  );
}