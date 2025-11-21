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

/**
 * Komponen Dialog untuk mengatur margin cetak dan mengekspor laporan Predikat
 * ke PDF atau Excel.
 */
export default function AdjustPrintMarginLaporanPredikat({
  adjustDialog,
  setAdjustDialog,
  dataPredikat = [], // Data yang diterima adalah list Predikat
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false);
  const [config, setConfig] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "landscape", // Default landscape karena deskripsi panjang
  });

  const paperSizes = [
    { name: "A4", value: "A4" },
    { name: "Letter", value: "Letter" },
    { name: "Legal", value: "Legal" },
  ];

  const orientationOptions = [
    { label: "Potrait", value: "portrait" },
    { label: "Lanskap", value: "landscape" },
  ];

  const onChangeNumber = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onChangeSelect = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value }));
  };

  // 🟩 Header PDF (Kop Surat)
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width;

    // Nama Sekolah
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185); // Biru
    doc.text("SEKOLAH NEGERI 1 MADIUN", pageWidth / 2, marginTop + 5, {
      align: "center",
    });

    // Alamat
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Jl. Pendidikan No. 10, Kota Madiun, Jawa Timur",
      pageWidth / 2,
      marginTop + 12,
      { align: "center" }
    );

    // Garis Pemisah
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, marginTop + 18, pageWidth - marginRight, marginTop + 18);

    // Judul Laporan
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, marginTop + 25, { align: "center" });

    // Tanggal Cetak
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${today}`, marginLeft, marginTop + 33, {
      align: "left",
    });

    return marginTop + 38; // Return Y start position untuk tabel
  };

  // 🟥 Export PDF
  async function exportPDF(config) {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);

    const startY = addHeader(
      doc,
      "LAPORAN DATA DESKRIPSI PREDIKAT",
      mL,
      mT,
      mR
    );

    // 🧾 Konfigurasi Tabel PDF
    autoTable(doc, {
      startY,
      head: [
        [
          "No",
          "Mata Pelajaran",
          "Tingkat",
          "Jurusan",
          "Kelas",
          "Deskripsi A (Sangat Baik)",
          "Deskripsi B (Baik)",
          "Deskripsi C (Cukup)",
        ],
      ],
      body: dataPredikat.map((item, index) => [
        index + 1,
        item.mapel?.NAMA_MAPEL || item.KODE_MAPEL || "-",
        item.target?.TINGKATAN_ID || "-",
        item.target?.NAMA_JURUSAN || item.target?.JURUSAN_ID || "Umum",
        item.target?.KELAS_ID || "Umum",
        item.deskripsi?.A || "-",
        item.deskripsi?.B || "-",
        item.deskripsi?.C || "-",
      ]),
      margin: { left: mL, right: mR },
      styles: { 
        fontSize: 8, 
        cellPadding: 2, 
        valign: 'top', // Teks rata atas supaya rapi jika deskripsi panjang
        overflow: 'linebreak' // Bungkus teks panjang
      },
      columnStyles: {
        0: { cellWidth: 8 },  // No
        1: { cellWidth: 30 }, // Mapel
        2: { cellWidth: 12 }, // Tingkat
        3: { cellWidth: 20 }, // Jurusan
        4: { cellWidth: 15 }, // Kelas
        // Sisa width dibagi rata untuk deskripsi
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
          doc.internal.pageSize.width - mR - 20,
          doc.internal.pageSize.height - 5
        );
      },
    });

    return doc.output("datauristring");
  }

  // 🟨 Export Excel
  const exportExcel = () => {
    const dataForExcel = dataPredikat.map((item, index) => ({
      "No": index + 1,
      "Mata Pelajaran": item.mapel?.NAMA_MAPEL || item.KODE_MAPEL || "-",
      "Tingkat": item.target?.TINGKATAN_ID || "-",
      "Jurusan": item.target?.NAMA_JURUSAN || item.target?.JURUSAN_ID || "Umum",
      "Kelas": item.target?.KELAS_ID || "Umum",
      "Deskripsi A": item.deskripsi?.A || "-",
      "Deskripsi B": item.deskripsi?.B || "-",
      "Deskripsi C": item.deskripsi?.C || "-",
      "Deskripsi D": item.deskripsi?.D || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Auto-width kolom excel sederhana
    const wscols = [
        {wch: 5},  // No
        {wch: 30}, // Mapel
        {wch: 10}, // Tingkat
        {wch: 15}, // Jurusan
        {wch: 10}, // Kelas
        {wch: 50}, // Desk A
        {wch: 50}, // Desk B
        {wch: 50}, // Desk C
        {wch: 50}, // Desk D
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Predikat");
    XLSX.writeFile(wb, "Laporan_Data_Predikat.xlsx");
  };

  // 🧩 Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(config);
      setPdfUrl(pdfDataUrl);
      setFileName("Laporan_Data_Predikat");
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } finally {
      setLoadingExport(false);
    }
  };

  // 🟢 Footer Toolbar
  const footer = () => (
    <div className="flex flex-row gap-2 justify-content-end">
      <Button
        label="Export Excel"
        icon="pi pi-file-excel"
        severity="success"
        onClick={exportExcel}
      />
      <Button
        label="Export PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        onClick={handleExportPdf}
        loading={loadingExport}
      />
    </div>
  );

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak Laporan Predikat"
      style={{ width: "55vw" }}
      modal
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
    >
      <div className="grid p-fluid">
        <div className="col-12 md:col-6">
          <h5>Pengaturan Margin (mm)</h5>
          <div className="grid formgrid">
            {["Top", "Bottom", "Right", "Left"].map((label) => (
              <div className="col-6 field" key={label}>
                <label>Margin {label}</label>
                <InputNumber
                  value={config[`margin${label}`]}
                  onChange={(e) => onChangeNumber(e, `margin${label}`)}
                  min={0}
                  suffix=" mm"
                  showButtons
                  className="w-full"
                  inputStyle={{ padding: "0.3rem" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 md:col-6">
          <h5>Pengaturan Kertas</h5>
          <div className="field">
            <label>Ukuran Kertas</label>
            <Dropdown
              value={config.paperSize}
              options={paperSizes}
              onChange={(e) => onChangeSelect(e, "paperSize")}
              optionLabel="name"
              className="w-full"
            />
          </div>
          <div className="field">
            <label>Orientasi</label>
            <Dropdown
              value={config.orientation}
              options={orientationOptions}
              onChange={(e) => onChangeSelect(e, "orientation")}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Toolbar className="py-2 justify-content-end" end={footer} />
    </Dialog>
  );
}