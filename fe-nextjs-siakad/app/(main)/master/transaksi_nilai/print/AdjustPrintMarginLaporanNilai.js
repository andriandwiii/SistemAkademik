"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function AdjustPrintMarginLaporanNilai({
  visible,
  onHide,
  dataNilai = [],
  meta = {}, // { kkm: 75 }
  info = {}, // { KELAS: "XMA", MAPEL: "MTK" ... } untuk header
  setPdfUrl,
  setFileName,
  setPreviewOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ top: 10, left: 10, size: "A4", orient: "landscape" }); 

  const getPred = (val) => {
    if(!val) return "-";
    const v=parseFloat(val), k=parseFloat(meta.kkm), i=(100-k)/3;
    if(v<k)return "D"; if(v<k+i)return "C"; if(v<k+(i*2))return "B"; return "A";
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: config.orient, unit: "mm", format: config.size });
    
    // Header
    doc.setFontSize(14); doc.text("LAPORAN NILAI SISWA", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Kelas: ${info.KELAS} | Mapel: ${info.MAPEL} | KKM: ${meta.kkm}`, 105, 22, { align: "center" });

    // Table
    autoTable(doc, {
      startY: 30,
      margin: { top: config.top, left: config.left },
      head: [[
        { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'NIS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Nama Siswa', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'PENGETAHUAN', colSpan: 2, styles: { halign: 'center' } },
        { content: 'KETERAMPILAN', colSpan: 2, styles: { halign: 'center' } }
      ], [
        'Nilai', 'Pred', 'Nilai', 'Pred'
      ]],
      body: dataNilai.map((d, i) => [
        i + 1,
        d.nis,
        d.nama,
        d.nilai_p || "-",
        getPred(d.nilai_p),
        d.nilai_k || "-",
        getPred(d.nilai_k)
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [62, 138, 204] } 
    });

    return doc.output("datauristring");
  };

  const handleExportPDF = async () => {
    setLoading(true);
    const url = generatePDF();
    setPdfUrl(url);
    setFileName(`Nilai_${info.KELAS}`);
    setLoading(false);
    onHide(); 
    setPreviewOpen(true); 
  };

  const handleExportExcel = () => {
    const data = dataNilai.map((d, i) => ({
      No: i + 1,
      NIS: d.nis,
      Nama: d.nama,
      "Nilai P": d.nilai_p,
      "Pred P": getPred(d.nilai_p),
      "Nilai K": d.nilai_k,
      "Pred K": getPred(d.nilai_k)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai");
    XLSX.writeFile(wb, `Nilai_${info.KELAS}_${info.MAPEL}.xlsx`);
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Export Nilai" style={{ width: "400px" }}>
      <div className="flex flex-column gap-3">
        <div className="flex justify-content-between">
           <label>Ukuran</label>
           <Dropdown value={config.size} options={['A4','Letter']} onChange={(e)=>setConfig({...config,size:e.value})} />
        </div>
        <div className="flex justify-content-between">
           <label>Orientasi</label>
           <Dropdown value={config.orient} options={['portrait','landscape']} onChange={(e)=>setConfig({...config,orient:e.value})} />
        </div>
      </div>
      <Toolbar className="mt-4 border-none p-0 bg-transparent" end={
        <div className="flex gap-2">
           <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={handleExportExcel} />
           <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={handleExportPDF} loading={loading} />
        </div>
      }/>
    </Dialog>
  );
}