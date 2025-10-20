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

export default function AdjustPrintMarginLaporanUser({
  adjustDialog,
  setAdjustDialog,
  dataUser = [],
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

  // 🔹 Header PDF
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
  async function exportPDF(config) {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);

    const startY = addHeader(doc, "LAPORAN DATA USER", mL, mT, mR);

    autoTable(doc, {
      startY,
      head: [["No", "Nama", "Email", "Role"]],
      body: dataUser.map((u, index) => [
        index + 1,
        u.name || "-",
        u.email || "-",
        u.role || "-",
      ]),
      margin: { left: mL, right: mR },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
          doc.internal.pageSize.width - mR - 25,
          doc.internal.pageSize.height - 5
        );
      },
    });

    return doc.output("datauristring");
  }

  // 🔸 Export Excel
  const exportExcel = () => {
    const dataForExcel = dataUser.map((u, index) => ({
      No: index + 1,
      Nama: u.name || "-",
      Email: u.email || "-",
      Role: u.role || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data User");
    XLSX.writeFile(wb, "Laporan_Data_User.xlsx");
  };

  // 🔸 Handle Export PDF
  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(config);
      setPdfUrl(pdfDataUrl);
      setFileName("Laporan_Data_User");
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } finally {
      setLoadingExport(false);
    }
  };

  // 🔹 Footer Toolbar
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

  // 🔹 UI Dialog
  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak Laporan User"
      style={{ width: "55vw" }}
      modal
    >
      <div className="grid p-fluid">
        {/* Margin Settings */}
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

        {/* Paper Settings */}
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
