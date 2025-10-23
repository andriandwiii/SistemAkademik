"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function AdjustPrintMarginLaporan({
  adjustDialog,
  setAdjustDialog,
  dataGuru = [],
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

  // Header laporan
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("SEKOLAH NEGERI 1 MADIUN", pageWidth / 2, marginTop + 5, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Jl. Pendidikan No. 10, Kota Madiun, Jawa Timur",
      pageWidth / 2,
      marginTop + 12,
      { align: "center" }
    );

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
    doc.text(`Dicetak pada: ${today}`, marginLeft, marginTop + 33, {
      align: "left",
    });

    return marginTop + 38;
  };

  // Export PDF
  const exportPDF = async (adjustConfig) => {
    const doc = new jsPDF({
      orientation: adjustConfig.orientation,
      unit: "mm",
      format: adjustConfig.paperSize,
    });

    const marginLeft = parseFloat(adjustConfig.marginLeft);
    const marginTop = parseFloat(adjustConfig.marginTop);
    const marginRight = parseFloat(adjustConfig.marginRight);

    const startY = addHeader(
      doc,
      "LAPORAN DATA GURU",
      marginLeft,
      marginTop,
      marginRight
    );

    autoTable(doc, {
      startY,
      head: [
        [
          "No",
          "NIP",
          "Nama",
          "Pangkat",
          "Jabatan",
          "Status",
          "JK",
          "Tgl Lahir",
          "Email",
          "No. Telp",
          "Mapel",
        ],
      ],
      body: dataGuru.map((g, index) => [
        index + 1,
        g.NIP || "-",
        g.NAMA || "-",
        g.PANGKAT || "-",
        g.JABATAN || "-",
        g.STATUS_KEPEGAWAIAN || "-",
        g.GENDER === "L" ? "Laki-laki" : "Perempuan",
        g.TGL_LAHIR ? new Date(g.TGL_LAHIR).toLocaleDateString("id-ID") : "-",
        g.EMAIL || "-",
        g.NO_TELP || "-",
        g.MAPEL_DIAMPU || "-",
      ]),
      margin: { left: marginLeft, right: marginRight },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
    });

    // Generate blob URL
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    return url;
  };

  // Export Excel
  const exportExcel = () => {
    const dataForExcel = dataGuru.map((g, index) => ({
      No: index + 1,
      NIP: g.NIP || "-",
      Nama: g.NAMA || "-",
      Pangkat: g.PANGKAT || "-",
      Jabatan: g.JABATAN || "-",
      "Status Kepegawaian": g.STATUS_KEPEGAWAIAN || "-",
      "Jenis Kelamin": g.GENDER === "L" ? "Laki-laki" : "Perempuan",
      "Tempat Lahir": g.TEMPAT_LAHIR || "-",
      "Tanggal Lahir": g.TGL_LAHIR
        ? new Date(g.TGL_LAHIR).toLocaleDateString("id-ID")
        : "-",
      Email: g.EMAIL || "-",
      "No. Telp": g.NO_TELP || "-",
      Alamat: g.ALAMAT || "-",
      "Pendidikan Terakhir": g.PENDIDIKAN_TERAKHIR || "-",
      Universitas: g.UNIVERSITAS || "-",
      "Tahun Lulus": g.TAHUN_LULUS || "-",
      "No. Sertifikat": g.NO_SERTIFIKAT_PENDIDIK || "-",
      "Tahun Sertifikat": g.TAHUN_SERTIFIKAT || "-",
      "Mapel Diampu": g.MAPEL_DIAMPU || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Guru");

    // Set column widths
    ws["!cols"] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 35 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
    ];

    XLSX.writeFile(wb, "Laporan_Data_Guru.xlsx");
  };

  // Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfUrl = await exportPDF(dataAdjust);
      setPdfUrl(pdfUrl);
      setFileName("Laporan_Data_Guru");
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
      header="Pengaturan Cetak Laporan Data Guru"
      style={{ width: "50vw" }}
      modal
    >
      <div className="grid p-fluid">
        {/* Info */}
        <div className="col-12 mb-3">
          <div className="p-3 bg-blue-50 border-round">
            <p className="text-sm text-blue-800 m-0">
              <i className="pi pi-info-circle mr-2"></i>
              Total Data: <strong>{dataGuru.length} Guru</strong>
            </p>
          </div>
        </div>

        {/* Margin Settings */}
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
                  max={50}
                  suffix=" mm"
                  showButtons
                  className="w-full"
                  inputStyle={{ padding: "0.3rem" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Paper Settings */}
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