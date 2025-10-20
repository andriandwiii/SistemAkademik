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
  dataSiswa = [],
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false);
  const [dataAdjust, setDataAdjust] = useState({
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

  const onInputChangeNumber = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onInputChange = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value }));
  };

  // 🔹 Header laporan
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

    return marginTop + 38;
  };

  // 🔸 Export PDF
  async function exportPDF(adjustConfig) {
    const doc = new jsPDF({
      orientation: adjustConfig.orientation,
      unit: "mm",
      format: adjustConfig.paperSize,
    });

    const marginLeft = parseFloat(adjustConfig.marginLeft);
    const marginTop = parseFloat(adjustConfig.marginTop);
    const marginRight = parseFloat(adjustConfig.marginRight);

    const startY = addHeader(doc, "LAPORAN DATA SISWA", marginLeft, marginTop, marginRight);

    autoTable(doc, {
      startY,
      head: [
        [
          "ID",
          "NIS",
          "NISN",
          "Nama",
          "Jenis Kelamin",
          "Tanggal Lahir",
          "Email",
          "Status",
          "Kelas",
          "Jurusan",
          "Tahun Masuk",
        ],
      ],
      body: dataSiswa.map((s) => [
        s.SISWA_ID,
        s.NIS || "-",
        s.NISN || "-",
        s.NAMA || "-",
        s.GENDER === "L" ? "Laki-laki" : "Perempuan",
        s.TGL_LAHIR ? new Date(s.TGL_LAHIR).toLocaleDateString("id-ID") : "-",
        s.EMAIL || "-",
        s.STATUS || "-",
        s.transaksi?.kelas
          ? `${s.transaksi.kelas.TINGKATAN} ${s.transaksi.kelas.NAMA_KELAS}`
          : "-",
        s.transaksi?.kelas?.NAMA_JURUSAN || "-",
        s.transaksi?.TAHUN_AJARAN || "-",
      ]),
      margin: { left: marginLeft, right: marginRight },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
    });

    return doc.output("datauristring");
  }

  // 🔸 Export Excel
  const exportExcel = () => {
    const dataForExcel = dataSiswa.map((s) => ({
      ID: s.SISWA_ID,
      NIS: s.NIS,
      NISN: s.NISN,
      Nama: s.NAMA,
      "Jenis Kelamin": s.GENDER === "L" ? "Laki-laki" : "Perempuan",
      "Tanggal Lahir": s.TGL_LAHIR
        ? new Date(s.TGL_LAHIR).toLocaleDateString("id-ID")
        : "-",
      Email: s.EMAIL,
      Status: s.STATUS,
      "Kelas":
        s.transaksi?.kelas
          ? `${s.transaksi.kelas.TINGKATAN} ${s.transaksi.kelas.NAMA_KELAS}`
          : "-",
      Jurusan: s.transaksi?.kelas?.NAMA_JURUSAN || "-",
      "Tahun Masuk": s.transaksi?.TAHUN_AJARAN || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, "Laporan_Data_Siswa.xlsx");
  };

  // 🔸 Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(dataAdjust);
      setPdfUrl(pdfDataUrl);
      setFileName("Laporan_Data_Siswa");
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } finally {
      setLoadingExport(false);
    }
  };

  const footer = () => (
    <div className="flex flex-row gap-2">
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
      header="Pengaturan Cetak Laporan Data Siswa"
      style={{ width: "50vw" }}
      modal
    >
      <div className="grid p-fluid">
        <div className="col-12 md:col-6">
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Margin (mm)</h5>
            {["Top", "Bottom", "Right", "Left"].map((label) => (
              <div className="col-6 field" key={label}>
                <label>Margin {label}</label>
                <InputNumber
                  value={dataAdjust[`margin${label}`]}
                  onChange={(e) => onInputChangeNumber(e, `margin${label}`)}
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
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Kertas</h5>
            <div className="col-12 field">
              <label>Ukuran Kertas</label>
              <Dropdown
                value={dataAdjust.paperSize}
                options={paperSizes}
                onChange={(e) => onInputChange(e, "paperSize")}
                optionLabel="name"
                className="w-full"
              />
            </div>
            <div className="col-12 field">
              <label>Orientasi</label>
              <Dropdown
                value={dataAdjust.orientation}
                options={orientationOptions}
                onChange={(e) => onInputChange(e, "orientation")}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <Toolbar className="py-2 justify-content-end" end={footer} />
    </Dialog>
  );
}
