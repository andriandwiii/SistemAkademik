"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormMasterUjian from "./components/FormMasterUjian";
import dynamic from "next/dynamic";

// Print
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginUjian = dynamic(() => import("./print/AdjustPrintMarginUjian"), { ssr: false });

export default function MasterUjianPage() {
  const toastRef = useRef(null);

  const [ujianList, setUjianList] = useState([]);
  const [jenisUjianList, setJenisUjianList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10,
    paperSize: "A4", orientation: "portrait"
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) window.location.href = "/";
    else {
      fetchJenisUjian();
      fetchUjian();
    }
  }, [token]);

  const fetchJenisUjian = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jenis-ujian`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      setJenisUjianList(json.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchUjian = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-data-ujian`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      setUjianList(json.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-data-ujian`, { method: "POST", headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify(data) });
        toastRef.current?.showToast("00", "Ujian berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedUjian) {
        await fetch(`${API_URL}/master-data-ujian/${selectedUjian.ID}`, { method:"PUT", headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify(data) });
        toastRef.current?.showToast("00", "Ujian berhasil diubah");
      }
      fetchUjian();
      setDialogMode(null); setSelectedUjian(null);
    } catch(err){ console.error(err); toastRef.current?.showToast("01","Terjadi kesalahan saat menyimpan ujian"); }
    finally{ setLoading(false); }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message:`Yakin ingin menghapus ujian "${row.KODE_UJIAN}"?`,
      header:"Konfirmasi Hapus",
      icon:"pi pi-exclamation-triangle",
      acceptLabel:"Hapus",
      rejectLabel:"Batal",
      acceptClassName:"p-button-danger",
      accept: async ()=>{
        setLoading(true);
        try {
          await fetch(`${API_URL}/master-data-ujian/${row.ID}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
          toastRef.current?.showToast("00","Ujian berhasil dihapus");
          fetchUjian();
        } catch(err){ console.error(err); toastRef.current?.showToast("01","Terjadi kesalahan saat menghapus ujian"); }
        finally{ setLoading(false); }
      }
    });
  };

  const columns = [
     { field: "ID", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "KODE_UJIAN", header: "Nama Ujian" },
    { field: "METODE", header: "Metode" },
    { field: "DURASI", header: "Durasi" },
    { field: "ACAK_SOAL", header: "Acak Soal", body:(row)=>row.ACAK_SOAL?"Ya":"Tidak" },
    { field: "ACAK_JAWABAN", header: "Acak Jawaban", body:(row)=>row.ACAK_JAWABAN?"Ya":"Tidak" },
    { field: "STATUS", header: "Status" },
    { header: "Actions", body:(row)=><div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" severity="warning" onClick={()=>{ setSelectedUjian(row); setDialogMode("edit"); }} />
      <Button icon="pi pi-trash" size="small" severity="danger" onClick={()=>handleDelete(row)} />
    </div> }
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">Master Data Ujian</h3>

      {/* Toolbar */}
      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button icon="pi pi-print" severity="warning" onClick={()=>setAdjustDialog(true)} />
        <span className="p-input-icon-left">
          <i className="pi pi-search"/>
          <InputText value={searchKeyword} onChange={(e)=>setSearchKeyword(e.target.value)} placeholder="Cari kode atau metode..." className="w-64"/>
        </span>
        <Button label="Tambah Ujian" icon="pi pi-plus" severity="info" onClick={()=>{ setDialogMode("add"); setSelectedUjian(null); }} />
      </div>

      <CustomDataTable data={ujianList} loading={loading} columns={columns} />

      {/* Form */}
      <FormMasterUjian visible={dialogMode!==null} selectedUjian={selectedUjian} jenisUjianList={jenisUjianList} onHide={()=>{ setDialogMode(null); setSelectedUjian(null); }} onSave={handleSave} />

      {/* Print */}
      <AdjustPrintMarginUjian visible={adjustDialog} setVisible={setAdjustDialog} dataUjian={ujianList} setPdfUrl={setPdfUrl} setFileName={setFileName} setJsPdfPreviewOpen={setJsPdfPreviewOpen} dataAdjust={dataAdjust} setDataAdjust={setDataAdjust} />

      {/* PDF Preview */}
      <Dialog visible={jsPdfPreviewOpen} onHide={()=>setJsPdfPreviewOpen(false)} modal style={{width:"90vw",height:"90vh"}} header="Preview Laporan Master Ujian" blockScroll>
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>
    </div>
  );
}
