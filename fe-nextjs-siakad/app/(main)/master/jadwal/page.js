"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormJadwal from "./components/FormJadwal";
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
const URUTAN_HARI = { "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6, "Minggu": 7 };

const getTingkatScore = (txt) => {
  if (!txt) return 99;
  const t = txt.toUpperCase();
  if (t.startsWith("XII")) return 3;
  if (t.startsWith("XI")) return 2;
  if (t.startsWith("X")) return 1;
  return 9;
};

export default function JadwalPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [jadwal, setJadwal] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [namaKurikulum, setNamaKurikulum] = useState("");
  const [nipKurikulum, setNipKurikulum] = useState("");

  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [selectedJadwalForPrint, setSelectedJadwalForPrint] = useState(null);
  const [adjustJadwalDialog, setAdjustJadwalDialog] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const [hariFilter, setHariFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);

  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  const sortDataOtomatis = useCallback((data) => {
    return [...data].sort((a, b) => {
      const hA = a.hari?.HARI || a.HARI || "";
      const hB = b.hari?.HARI || b.HARI || "";
      if ((URUTAN_HARI[hA] || 99) !== (URUTAN_HARI[hB] || 99)) 
        return (URUTAN_HARI[hA] || 99) - (URUTAN_HARI[hB] || 99);

      const kA = a.kelas?.KELAS_ID || a.KELAS_ID || "";
      const kB = b.kelas?.KELAS_ID || b.KELAS_ID || "";
      const sA = getTingkatScore(kA), sB = getTingkatScore(kB);
      if (sA !== sB) return sA - sB;

      const compK = kA.localeCompare(kB, undefined, { numeric: true });
      if (compK !== 0) return compK;

      const jpA = parseInt(a.jam_pelajaran?.JP_KE || a.KODE_JP || 0);
      const jpB = parseInt(b.jam_pelajaran?.JP_KE || b.KODE_JP || 0);
      return jpA - jpB;
    });
  }, []);

  const fetchJadwal = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jadwal`, { headers: { Authorization: `Bearer ${t}` } });
      if (isMounted.current && res.data.status === "00") {
        const raw = res.data.data || [];
        setOriginalData(raw);
        setJadwal(sortDataOtomatis(raw));

        const hSet = new Set(), tSet = new Set(), kSet = new Set();
        raw.forEach(d => {
          if (d.hari?.HARI) hSet.add(d.hari.HARI);
          if (d.tingkatan?.TINGKATAN) tSet.add(d.tingkatan.TINGKATAN);
          if (d.kelas?.KELAS_ID) kSet.add(d.kelas.KELAS_ID);
        });

        setHariOptions(Array.from(hSet).sort((a,b)=>URUTAN_HARI[a]-URUTAN_HARI[b]).map(v=>({label:v, value:v})));
        setTingkatanOptions(Array.from(tSet).sort().map(v=>({label:v, value:v})));
        setKelasOptions(Array.from(kSet).sort((a,b) => {
          const s1 = getTingkatScore(a), s2 = getTingkatScore(b);
          return s1 !== s2 ? s1 - s2 : a.localeCompare(b, undefined, {numeric:true});
        }).map(v=>({label:v, value:v})));
      }
    } catch (err) { console.error(err); }
    finally { if (isMounted.current) setIsLoading(false); }
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { window.location.href = "/"; } 
    else {
      setToken(t);
      fetchJadwal(t);
      // Fetch Kurikulum data
      axios.get(`${API_URL}/users/kurikulum`, { headers: { Authorization: `Bearer ${t}` } })
        .then(res => {
          if (res.data.status === "00") {
            setNamaKurikulum(res.data.data.name || "");
            setNipKurikulum(res.data.data.nip || "");
          }
        }).catch(e => console.error(e));
    }
    return () => { isMounted.current = false; };
  }, []);

  const applyFilters = (h, t, k) => {
    let filtered = [...originalData];
    if (h) filtered = filtered.filter(x => (x.hari?.HARI || x.HARI) === h);
    if (t) filtered = filtered.filter(x => (x.tingkatan?.TINGKATAN || x.TINGKATAN_ID) === t);
    if (k) filtered = filtered.filter(x => (x.kelas?.KELAS_ID || x.KELAS_ID) === k);
    setJadwal(sortDataOtomatis(filtered));
  };

  const handleSubmit = async (data) => {
    // Validasi Bentrok Guru
    const bentrokGuru = originalData.find(j => 
      (j.hari?.HARI || j.HARI) === data.HARI &&
      (j.jam_pelajaran?.KODE_JP || j.KODE_JP) === data.KODE_JP &&
      (j.guru?.NIP || j.NIP) === data.NIP &&
      j.ID !== selectedJadwal?.ID
    );
    if (bentrokGuru) {
      toastRef.current?.showToast("01", `Guru sudah mengajar di kelas ${bentrokGuru.kelas?.KELAS_ID} pada jam ini.`);
      return;
    }

    // Validasi Bentrok Kelas
    const bentrokKelas = originalData.find(j => 
      (j.hari?.HARI || j.HARI) === data.HARI &&
      (j.jam_pelajaran?.KODE_JP || j.KODE_JP) === data.KODE_JP &&
      (j.kelas?.KELAS_ID || j.KELAS_ID) === data.KELAS_ID &&
      j.ID !== selectedJadwal?.ID
    );
    if (bentrokKelas) {
      toastRef.current?.showToast("01", `Kelas ini sudah terisi jadwal lain pada jam ini.`);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = selectedJadwal 
        ? await axios.put(`${API_URL}/jadwal/${selectedJadwal.ID}`, data, config)
        : await axios.post(`${API_URL}/jadwal`, data, config);

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Berhasil disimpan");
        setDialogVisible(false);
        fetchJadwal(token);
      }
    } catch (err) { toastRef.current?.showToast("01", "Gagal menyimpan data"); }
  };

  const jadwalColumns = [
    { field: "KODE_JADWAL", header: "Kode", style: { minWidth: "100px" } },
    { field: "HARI", header: "Hari", body: r => r.hari?.HARI || r.HARI },
    { field: "KELAS_ID", header: "Kelas", body: r => r.kelas?.KELAS_ID || r.KELAS_ID },
    { field: "GURU", header: "Guru", body: r => r.guru?.NAMA_GURU || r.NIP, style: { minWidth: "180px" } },
    { field: "MAPEL", header: "Mata Pelajaran", body: r => r.mata_pelajaran?.NAMA_MAPEL, style: { minWidth: "150px" } },
    { 
      header: "Jam & Waktu", 
      style: { minWidth: "160px" },
      body: (r) => (
        <div className="flex flex-column">
          <span className="font-bold">Ke-{r.jam_pelajaran?.JP_KE || r.KODE_JP}</span>
          {r.jam_pelajaran?.WAKTU_MULAI && (
            <small className="text-gray-500 italic">
              ({r.jam_pelajaran.WAKTU_MULAI.substring(0,5)} - {r.jam_pelajaran.WAKTU_SELESAI.substring(0,5)})
            </small>
          )}
        </div>
      )
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-1">
          <Button icon="pi pi-print" size="small" severity="success" tooltip="Cetak Absensi" onClick={() => { setSelectedJadwalForPrint(r); setAdjustDialog(true); }} />
          <Button icon="pi pi-users" size="small" severity="info" tooltip="Daftar Siswa" onClick={() => { setSelectedJadwalForSiswa(r); setSiswaDialogVisible(true); }} />
          <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Edit" onClick={() => { setSelectedJadwal(r); setDialogVisible(true); }} />
          <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Hapus" onClick={() => {
            confirmDialog({
              message: `Hapus jadwal ${r.KODE_JADWAL}?`,
              header: "Konfirmasi",
              icon: "pi pi-trash",
              acceptClassName: "p-button-danger",
              accept: async () => {
                try {
                  await axios.delete(`${API_URL}/jadwal/${r.ID}`, { headers: { Authorization: `Bearer ${token}` } });
                  toastRef.current?.showToast("00", "Dihapus");
                  fetchJadwal(token);
                } catch (e) { toastRef.current?.showToast("01", "Gagal"); }
              }
            });
          }} />
        </div>
      )
    }
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      <h3 className="text-xl font-bold mb-4">Master Jadwal Pelajaran</h3>

      <div className="flex flex-column md:flex-row justify-content-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-end">
          <Dropdown value={hariFilter} options={hariOptions} onChange={e => {setHariFilter(e.value); applyFilters(e.value, tingkatanFilter, kelasFilter)}} placeholder="Hari" className="w-32" showClear />
          <Dropdown value={tingkatanFilter} options={tingkatanOptions} onChange={e => {setTingkatanFilter(e.value); applyFilters(hariFilter, e.value, kelasFilter)}} placeholder="Tingkat" className="w-32" showClear />
          <Dropdown value={kelasFilter} options={kelasOptions} onChange={e => {setKelasFilter(e.value); applyFilters(hariFilter, tingkatanFilter, e.value)}} placeholder="Kelas" className="w-40" showClear />
          <Button icon="pi pi-filter-slash" severity="secondary" onClick={() => {setHariFilter(null); setTingkatanFilter(null); setKelasFilter(null); setJadwal(sortDataOtomatis(originalData))}} />
        </div>

        <div className="flex items-center gap-2">
          <Button icon="pi pi-print" severity="warning" tooltip="Cetak Laporan Jadwal" onClick={() => setAdjustJadwalDialog(true)} disabled={jadwal.length === 0} />
          <HeaderBar onSearch={(kw) => {
             const low = kw.toLowerCase();
             setJadwal(sortDataOtomatis(originalData.filter(x => 
                (x.guru?.NAMA_GURU || "").toLowerCase().includes(low) || 
                (x.kelas?.KELAS_ID || "").toLowerCase().includes(low)
             )));
          }} onAddClick={() => { setSelectedJadwal(null); setDialogVisible(true); }} />
        </div>
      </div>

      <CustomDataTable data={jadwal} loading={isLoading} columns={jadwalColumns} />

      <FormJadwal visible={dialogVisible} onHide={() => setDialogVisible(false)} selectedJadwal={selectedJadwal} onSave={handleSubmit} token={token} />
      <DialogSiswaKelas visible={siswaDialogVisible} onHide={() => setSiswaDialogVisible(false)} jadwalData={selectedJadwalForSiswa} token={token} />
      <AdjustPrintMarginAbsensi adjustDialog={adjustDialog} setAdjustDialog={setAdjustDialog} jadwalData={selectedJadwalForPrint} token={token} setPdfUrl={setPdfUrl} setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen} />
      <AdjustPrintMarginJadwal adjustDialog={adjustJadwalDialog} setAdjustDialog={setAdjustJadwalDialog} jadwalToPrint={jadwal} setPdfUrl={setPdfUrl} setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen} namaKurikulum={namaKurikulum} nipKurikulum={nipKurikulum} />
      
      <Dialog visible={jsPdfPreviewOpen} onHide={() => { setJsPdfPreviewOpen(false); setPdfUrl(""); }} modal maximizable style={{ width: "95vw", height: "95vh" }} header={`Preview - ${fileName}`}>
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>
    </div>
  );
}