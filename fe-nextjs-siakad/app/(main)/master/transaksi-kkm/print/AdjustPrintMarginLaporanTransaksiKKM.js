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
 * Komponen Dialog untuk mengatur margin cetak dan mengekspor laporan Transaksi KKM
 * ke PDF atau Excel.
 */
export default function AdjustPrintMarginLaporanTransaksiKKM({
  adjustDialog,
  setAdjustDialog,
  dataTransaksi = [], // Data yang diterima adalah list Transaksi KKM
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
    orientation: "portrait", // Default portrait cukup karena kolom tidak selebar deskripsi
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

  // 🟩 Header PDF (Kop Surat Standar)
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width;

    // Nama Sekolah
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185); // Biru
    doc.text("SMK NEGERI CONTOH", pageWidth / 2, marginTop + 5, {
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
      "LAPORAN DATA TRANSAKSI KKM",
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
          "Tahun Ajaran",
          "Mata Pelajaran",
          "Tingkat",
          "Jurusan",
          "Kelas",
          "Nilai KKM",
        ],
      ],
      // Mapping data sesuai struktur tabel transaksi_kkm
      // Asumsi: Backend mengirim data yang sudah di-join (objek mapel, objek kkm, dll)
      body: dataTransaksi.map((item, index) => [
        index + 1,
        item.tahun_ajaran?.NAMA_TAHUN_AJARAN || item.TAHUN_AJARAN_ID || "-",
        item.mapel?.NAMA_MAPEL || item.KODE_MAPEL || "-",
        item.target?.TINGKATAN_ID || item.TINGKATAN_ID || "-",
        item.target?.NAMA_JURUSAN || item.JURUSAN_ID || "Umum",
        item.target?.KELAS_ID || item.KELAS_ID || "Umum",
        // Ambil nilai KKM dari relasi atau ID jika relasi null
        item.kkm?.NILAI_KKM ? `${item.kkm.NILAI_KKM}` : (item.KKM_ID || "-"), 
      ]),
      margin: { left: mL, right: mR },
      styles: { 
        fontSize: 9, 
        cellPadding: 3, 
        valign: 'middle',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // No
        1: { cellWidth: 30 }, // Tahun
        2: { cellWidth: 'auto' }, // Mapel (Auto fill sisa space)
        3: { cellWidth: 20, halign: 'center' }, // Tingkat
        4: { cellWidth: 30 }, // Jurusan
        5: { cellWidth: 20, halign: 'center' }, // Kelas
        6: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [0, 100, 0] }, // KKM (Hijau tebal)
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
    const dataForExcel = dataTransaksi.map((item, index) => ({
      "No": index + 1,
      "Tahun Ajaran": item.tahun_ajaran?.NAMA_TAHUN_AJARAN || item.TAHUN_AJARAN_ID || "-",
      "Kode Mapel": item.KODE_MAPEL || "-",
      "Nama Mata Pelajaran": item.mapel?.NAMA_MAPEL || "-",
      "Tingkat": item.TINGKATAN_ID || "-",
      "Jurusan": item.target?.NAMA_JURUSAN || item.JURUSAN_ID || "Berlaku Umum",
      "Kelas": item.target?.KELAS_ID || item.KELAS_ID || "Berlaku Umum",
      "Nilai KKM": item.kkm?.NILAI_KKM || item.KKM_ID || "-",
      "Predikat KKM": item.kkm?.PREDIKAT_DEFAULT || "-", // Opsional jika ada
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Auto-width kolom excel
    const wscols = [
        {wch: 5},  // No
        {wch: 15}, // Tahun
        {wch: 15}, // Kode Mapel
        {wch: 35}, // Nama Mapel
        {wch: 10}, // Tingkat
        {wch: 25}, // Jurusan
        {wch: 15}, // Kelas
        {wch: 12}, // Nilai KKM
        {wch: 15}, // Predikat
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi KKM");
    XLSX.writeFile(wb, "Laporan_Transaksi_KKM.xlsx");
  };

  // 🧩 Handle Export PDF Trigger
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(config);
      setPdfUrl(pdfDataUrl);
      setFileName("Laporan_Transaksi_KKM");
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
      header="Pengaturan Cetak Laporan KKM"
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