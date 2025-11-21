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

export default function AdjustPrintMarginLaporan({
  adjustDialog,
  setAdjustDialog,
  dataTransaksi = [], // Data transaksi yang sudah difilter
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
    orientation: "landscape",
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

  // 🟩 Header PDF
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("SEKOLAH NEGERI 1 MADIUN", pageWidth / 2, marginTop + 5, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Jl. Pendidikan No. 10, Kota Madiun, Jawa Timur", pageWidth / 2, marginTop + 12, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, marginTop + 18, pageWidth - marginRight, marginTop + 18);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, marginTop + 25, { align: "center" });

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${today}`, marginLeft, marginTop + 33, { align: "left" });

    return marginTop + 38; // Mengembalikan posisi Y setelah header
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

    const startY = addHeader(doc, "LAPORAN DATA PENEMPATAN SISWA KE KELAS", mL, mT, mR);

    // 🧾 Isi tabel lengkap
    autoTable(doc, {
      startY,
      head: [
        [
          "ID",
          "Nama Siswa",
          "NIS",
          "Tingkatan",
          "Jurusan",
          "Kelas",
          "Nama Ruang",
          "Tahun Ajaran"
        ],
      ],
      body: dataTransaksi.map((t) => [
        t.ID || t.TRANSAKSI_ID || "-",
        t.siswa?.NAMA || "-",
        t.siswa?.NIS || "-",
        t.tingkatan?.TINGKATAN || "-",
        t.jurusan?.NAMA_JURUSAN || "-",
        t.kelas?.KELAS_ID || "-",
        t.kelas?.NAMA_RUANG || "-",
        t.tahun_ajaran?.NAMA_TAHUN_AJARAN || "-",
      ]),
      margin: { left: mL, right: mR },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
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
    const dataForExcel = dataTransaksi.map((t) => ({
      ID: t.ID || t.TRANSAKSI_ID || "-",
      "Nama Siswa": t.siswa?.NAMA || "-",
      NIS: t.siswa?.NIS || "-",
      Tingkatan: t.tingkatan?.TINGKATAN || "-",
      Jurusan: t.jurusan?.NAMA_JURUSAN || "-",
      "Kelas": t.kelas?.KELAS_ID || "-",
      "Nama Ruang": t.kelas?.NAMA_RUANG || "-",
      "Tahun Ajaran": t.tahun_ajaran?.NAMA_TAHUN_AJARAN || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi Siswa");
    XLSX.writeFile(wb, "Laporan_Data_Transaksi_Siswa.xlsx");
  };

  // 🧩 Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(config);
      setPdfUrl(pdfDataUrl);
      setFileName("Laporan_Data_Transaksi_Siswa");
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

  // 🧠 UI Dialog
  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak Laporan Transaksi Siswa"
      style={{ width: "55vw" }}
      modal
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