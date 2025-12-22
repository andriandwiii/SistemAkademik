"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const modeOptions = [
  { name: "Per Semester (Penuh 6 Bulan)", value: "semester" },
  { name: "Per Jumlah Pertemuan (Manual)", value: "pertemuan" },
];

const semesterOptions = [
  { name: "Ganjil (Juli - Desember)", value: 1 },
  { name: "Genap (Januari - Juni)", value: 2 },
];

const generateTahunAjaranOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let i = -1; i <= 1; i++) {
    const startYear = currentYear + i;
    options.push({ name: `${startYear}/${startYear + 1}`, value: `${startYear}/${startYear + 1}` });
  }
  return options;
};

const getBase64ImageFromUrl = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
};

export default function AdjustPrintMarginAbsensi({
  adjustDialog, setAdjustDialog, jadwalData, token, setPdfUrl, setFileName, setJsPdfPreviewOpen
}) {
  const [loading, setLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [config, setConfig] = useState({
    mode: 'semester',
    jumlahPertemuan: 24,
    tahunAjaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    semester: 1,
    marginTop: 15, marginBottom: 15, marginRight: 10, marginLeft: 10,
    paperSize: "A4", orientation: "landscape",
  });

  useEffect(() => {
    if (adjustDialog && jadwalData?.kelas?.KELAS_ID) fetchSiswa();
  }, [adjustDialog]);

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-siswa`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === "00") {
        const filtered = res.data.data.filter(t => t.kelas?.KELAS_ID === jadwalData.kelas.KELAS_ID);
        setSiswaList(filtered.sort((a, b) => (a.siswa?.NAMA || "").localeCompare(b.siswa?.NAMA || "")));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const generatePDF = (logo) => {
    const doc = new jsPDF({ 
      orientation: config.orientation, 
      unit: "mm", 
      format: config.paperSize 
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const { marginLeft: mL, marginTop: mT, marginRight: mR, marginBottom: mB } = config;

    // --- LOGIKA HEADER ---
    const drawHeader = (doc) => {
      let curY = mT;
      if (logo) doc.addImage(logo, 'PNG', mL, curY, 12, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ABSENSI DAFTAR HADIR SISWA", pageWidth / 2, curY + 4, { align: "center" });
      doc.setFontSize(11);
      doc.text("SMA NEGERI 1 MADIUN", pageWidth / 2, curY + 9, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const labelSemester = config.semester === 1 ? "GANJIL" : "GENAP";
      const infoSub = config.mode === 'semester' 
        ? `TAHUN PELAJARAN ${config.tahunAjaran} - SEMESTER ${labelSemester}`
        : `DATA PERTEMUAN TAHUN ${new Date().getFullYear()}`;
      doc.text(infoSub, pageWidth / 2, curY + 13, { align: "center" });

      curY += 17;
      doc.setLineWidth(0.5);
      doc.line(mL, curY, pageWidth - mR, curY);
      doc.setLineWidth(0.1);
      doc.line(mL, curY + 0.8, pageWidth - mR, curY + 0.8); // Garis Ganda

      curY += 6;
      doc.setFontSize(8);
      // Info Kiri
      doc.text(`Mata Pelajaran : ${jadwalData?.mata_pelajaran?.NAMA_MAPEL || "-"}`, mL, curY);
      doc.text(`Guru Pengampu : ${jadwalData?.guru?.NAMA_GURU || "-"}`, mL, curY + 4);
      // Info Kanan
      doc.text(`Kelas : ${jadwalData?.tingkatan?.TINGKATAN || ""} ${jadwalData?.kelas?.KELAS_ID || ""}`, pageWidth - mR, curY, { align: "right" });
      doc.text(`Hari / Jam : ${jadwalData?.hari?.HARI || "-"} / ${jadwalData?.jam_pelajaran?.WAKTU_MULAI || ""}`, pageWidth - mR, curY + 4, { align: "right" });

      return curY + 8;
    };

    const startY = drawHeader(doc);

    // --- KONFIGURASI KOLOM ---
    let columns = [
      { header: "No", dataKey: "no" },
      { header: "Nama Siswa", dataKey: "nama" }
    ];
    let colStyles = { 
      no: { cellWidth: 7, halign: "center" }, 
      nama: { cellWidth: 50 } 
    };

    // Mode Pertemuan atau Semester
    if (config.mode === 'semester') {
        // Logic Header Semester (disingkat)
        const totalCols = 24; // Estimasi kolom absen
        for (let i = 1; i <= totalCols; i++) {
            columns.push({ header: i.toString(), dataKey: `c${i}` });
            colStyles[`c${i}`] = { cellWidth: (pageWidth - mL - mR - 75) / totalCols, halign: "center" };
        }
    } else {
        for (let i = 1; i <= config.jumlahPertemuan; i++) {
            columns.push({ header: i.toString(), dataKey: `p${i}` });
            colStyles[`p${i}`] = { cellWidth: (pageWidth - mL - mR - 75) / config.jumlahPertemuan, halign: "center" };
        }
    }

    // Kolom Rekap S/I/A
    ["S", "I", "A"].forEach(v => {
      columns.push({ header: v, dataKey: v.toLowerCase() });
      colStyles[v.toLowerCase()] = { cellWidth: 6, halign: "center" };
    });

    // --- DRAW TABLE ---
    autoTable(doc, {
      startY: startY,
      columns: columns,
      body: siswaList.map((s, i) => ({ no: i + 1, nama: s.siswa?.NAMA })),
      margin: { left: mL, right: mR, top: mT + 35, bottom: mB },
      styles: { fontSize: 7, lineColor: [0, 0, 0], lineWidth: 0.1, cellPadding: 1.5 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold", halign: "center" },
      columnStyles: colStyles,
      showHead: 'everyPage', // Judul tabel di setiap halaman
      didDrawPage: (data) => {
        // Footer Halaman
        doc.setFontSize(7);
        doc.text(`Halaman ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - mR, pageHeight - 5, { align: "right" });
      }
    });

    // --- LOGIKA TANDA TANGAN (ANTI TERPOTONG) ---
    let finalY = doc.lastAutoTable.finalY + 12;
    
    // Jika sisa ruang di bawah kurang dari 35mm, buat halaman baru
    if (finalY + 35 > pageHeight - mB) {
      doc.addPage();
      finalY = mT + 15;
    }

    const ttdX = pageWidth - mR - 60;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Madiun, ${new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`, ttdX, finalY);
    doc.text("Guru Mata Pelajaran,", ttdX, finalY + 5);
    
    doc.setFont("helvetica", "bold");
    doc.text(jadwalData?.guru?.NAMA_GURU || "...............................", ttdX, finalY + 23);
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${jadwalData?.guru?.NIP || "-"}`, ttdX, finalY + 27);

    return doc;
  };

  const handleGenerate = async () => {
    if (siswaList.length === 0) return alert("Belum ada data siswa di kelas ini.");
    setLoading(true);
    const logo = await getBase64ImageFromUrl("/favicon.ico");
    const doc = generatePDF(logo);
    setPdfUrl(doc.output("datauristring"));
    setFileName(`Absensi_${jadwalData?.kelas?.KELAS_ID || 'Data'}.pdf`);
    setJsPdfPreviewOpen(true);
    setAdjustDialog(false);
    setLoading(false);
  };

  return (
    <Dialog 
      visible={adjustDialog} 
      onHide={() => setAdjustDialog(false)} 
      header={<div className="flex align-items-center gap-2"><i className="pi pi-print text-primary"></i> <span>Pengaturan Cetak Absensi</span></div>} 
      style={{ width: "40vw" }} 
      modal 
      footer={(
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={() => setAdjustDialog(false)} />
          <Button label="Generate & Preview" icon="pi pi-file-pdf" className="p-button-raised" onClick={handleGenerate} loading={loading} />
        </div>
      )}
    >
      <div className="grid p-fluid">
        <div className="col-12">
            <label className="font-bold block mb-2">Konfigurasi Kolom</label>
            <Dropdown value={config.mode} options={modeOptions} onChange={(e) => setConfig({ ...config, mode: e.value })} optionLabel="name" />
        </div>

        {config.mode === 'semester' ? (
          <>
            <div className="col-6">
                <label className="text-sm mb-1 block">Tahun Ajaran</label>
                <Dropdown value={config.tahunAjaran} options={generateTahunAjaranOptions()} onChange={(e) => setConfig({ ...config, tahunAjaran: e.value })} optionLabel="name" />
            </div>
            <div className="col-6">
                <label className="text-sm mb-1 block">Semester</label>
                <Dropdown value={config.semester} options={semesterOptions} onChange={(e) => setConfig({ ...config, semester: e.value })} optionLabel="name" />
            </div>
          </>
        ) : (
          <div className="col-12">
            <label className="text-sm mb-1 block">Jumlah Pertemuan (Kolom)</label>
            <InputNumber value={config.jumlahPertemuan} onValueChange={(e) => setConfig({ ...config, jumlahPertemuan: e.value })} min={1} max={32} showButtons />
          </div>
        )}

        <div className="col-12"><Divider align="left"><span className="text-xs text-gray-400">Layout & Margin (mm)</span></Divider></div>

        <div className="col-6">
            <label className="text-xs">Margin Atas</label>
            <InputNumber value={config.marginTop} onValueChange={(e) => setConfig({ ...config, marginTop: e.value })} min={5} showButtons />
        </div>
        <div className="col-6">
            <label className="text-xs">Margin Kiri</label>
            <InputNumber value={config.marginLeft} onValueChange={(e) => setConfig({ ...config, marginLeft: e.value })} min={5} showButtons />
        </div>
        <div className="col-12">
            <p className="text-xs text-orange-500 mt-2 italic">* Disarankan menggunakan kertas A4 Landscape untuk hasil maksimal.</p>
        </div>
      </div>
    </Dialog>
  );
}