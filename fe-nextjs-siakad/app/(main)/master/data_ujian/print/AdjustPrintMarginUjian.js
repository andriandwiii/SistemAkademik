"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function AdjustPrintMarginMasterUjian({
  visible,
  setVisible,
  dataUjian = [],
  setPdfUrl,
}) {
  const [margin, setMargin] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    paperSize: "A4",
    orientation: "portrait",
  });

  const paperSizes = [
    { name: "A4", value: "A4" },
    { name: "Letter", value: "Letter" },
    { name: "Legal", value: "Legal" },
  ];

  const orientationOptions = [
    { label: "Portrait", value: "portrait" },
    { label: "Landscape", value: "landscape" },
  ];

  const handleExportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({
      orientation: margin.orientation,
      unit: "mm",
      format: margin.paperSize,
    });

    // ===== Header =====
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Master Ujian", pageWidth / 2, margin.marginTop + 5, { align: "center" });

    // ===== Table =====
    autoTable(doc, {
      startY: margin.marginTop + 12,
      head: [["No", "Kode Ujian", "Metode", "Durasi", "Acak Soal", "Acak Jawaban", "Status"]],
      body: dataUjian.map((u, i) => [
        i + 1,
        u.KODE_UJIAN || "-",
        u.METODE || "-",
        u.DURASI || "-",
        u.ACAK_SOAL ? "Ya" : "Tidak",
        u.ACAK_JAWABAN ? "Ya" : "Tidak",
        u.STATUS || "-",
      ]),
      margin: { top: margin.marginTop, left: margin.marginLeft, right: margin.marginRight },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
    });

    // ===== Generate PDF =====
    const pdfBlob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(pdfBlob));
    setVisible(false);
  };

  return (
    <Dialog
      header="Pengaturan Cetak Master Ujian"
      visible={visible}
      onHide={() => setVisible(false)}
      style={{ width: "40vw" }}
      modal
    >
      <div className="p-fluid">
        {/* Margin Inputs */}
        {["Top", "Bottom", "Left", "Right"].map((side) => (
          <div className="field" key={side}>
            <label>Margin {side} (mm)</label>
            <InputNumber
              value={margin[`margin${side}`]}
              onChange={(e) =>
                setMargin((prev) => ({ ...prev, [`margin${side}`]: e.value || 0 }))
              }
              min={0}
              max={50}
              showButtons
              suffix=" mm"
            />
          </div>
        ))}

        {/* Paper Size */}
        <div className="field">
          <label>Ukuran Kertas</label>
          <Dropdown
            value={margin.paperSize}
            options={paperSizes}
            optionLabel="name"
            onChange={(e) => setMargin((prev) => ({ ...prev, paperSize: e.value }))}
          />
        </div>

        {/* Orientation */}
        <div className="field">
          <label>Orientasi</label>
          <Dropdown
            value={margin.orientation}
            options={orientationOptions}
            onChange={(e) => setMargin((prev) => ({ ...prev, orientation: e.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            className="p-button-text"
            onClick={() => setVisible(false)}
          />
          <Button label="Export PDF" icon="pi pi-file-pdf" onClick={handleExportPdf} />
        </div>
      </div>
    </Dialog>
  );
}
