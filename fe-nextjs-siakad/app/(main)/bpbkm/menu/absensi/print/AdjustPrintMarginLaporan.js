"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function AdjustPrintMarginLaporan({
  adjustDialog,
  setAdjustDialog,
  dataMonitoring = [], // Menerima data monitoring kedisiplinan
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false);
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 15,
    marginBottom: 15,
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

  // Header Laporan Formal
  const addHeader = (doc, title, marginLeft, marginTop, marginRight) => {
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // Midnight Blue
    doc.text("LAPORAN MONITORING KEDISIPLINAN SISWA", pageWidth / 2, marginTop + 5, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Sistem Informasi Manajemen Sekolah - Verifikasi BK",
      pageWidth / 2,
      marginTop + 11,
      { align: "center" }
    );

    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, marginTop + 15, pageWidth - marginRight, marginTop + 15);

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(9);
    doc.text(`Dicetak pada: ${today}`, marginLeft, marginTop + 22);

    return marginTop + 28;
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
      "REKAPITULASI MONITORING",
      marginLeft,
      marginTop,
      marginRight
    );

    autoTable(doc, {
      startY,
      head: [
        ["No", "Tanggal", "NIS", "Nama Siswa", "Kelas", "Keterangan", "Catatan BK", "Status"],
      ],
      body: dataMonitoring.map((row, index) => [
        index + 1,
        row.TANGGAL ? new Date(row.TANGGAL).toLocaleDateString("id-ID") : "-",
        row.NIS || "-",
        row.siswa?.NAMA || row.NAMA || "-",
        row.posisi?.KELAS || row.KELAS_ID || "-",
        row.STATUS || "-",
        row.CATATAN_BK || "-",
        row.SUDAH_DITANGGANI === 1 ? "Terverifikasi" : "Pending",
      ]),
      margin: { left: marginLeft, right: marginRight },
      styles: { fontSize: 8, cellPadding: 2, font: "helvetica" },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { halign: 'center' },
        5: { fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const pdfBlob = doc.output("blob");
    return URL.createObjectURL(pdfBlob);
  };

  // Export Excel
  const exportExcel = () => {
    const dataForExcel = dataMonitoring.map((row, index) => ({
      No: index + 1,
      Tanggal: row.TANGGAL || "-",
      NIS: row.NIS || "-",
      "Nama Siswa": row.siswa?.NAMA || row.NAMA || "-",
      Kelas: row.posisi?.KELAS || row.KELAS_ID || "-",
      Keterangan: row.STATUS || "-",
      "Catatan BK": row.CATATAN_BK || "-",
      "Status Penanganan": row.SUDAH_DITANGGANI === 1 ? "Selesai" : "Pending",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Monitoring");

    ws["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 35 }, { wch: 18 }
    ];

    XLSX.writeFile(wb, `Laporan_Monitoring_${new Date().getTime()}.xlsx`);
  };

  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfUrl = await exportPDF(dataAdjust);
      setPdfUrl(pdfUrl);
      setFileName("Laporan_Monitoring_Siswa");
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak Laporan"
      style={{ width: "45vw" }}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportExcel} />
          <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={handleExportPdf} loading={loadingExport} />
        </div>
      }
    >
      <div className="grid p-fluid">
        <div className="col-12 mb-2">
          <div className="p-3 bg-gray-100 border-round flex align-items-center">
            <i className="pi pi-info-circle mr-2 text-blue-600"></i>
            <span>Terdapat <strong>{dataMonitoring.length} baris</strong> data siap cetak.</span>
          </div>
        </div>

        <div className="col-12 md:col-6">
          <h6 className="font-bold border-bottom-1 pb-2 border-300">Margin (mm)</h6>
          <div className="grid mt-2">
            <div className="col-6 field">
              <label className="text-sm font-semibold text-700">Atas</label>
              <InputNumber value={dataAdjust.marginTop} onValueChange={(e) => onInputChangeNumber(e, "marginTop")} showButtons min={0} suffix=" mm" />
            </div>
            <div className="col-6 field">
              <label className="text-sm font-semibold text-700">Bawah</label>
              <InputNumber value={dataAdjust.marginBottom} onValueChange={(e) => onInputChangeNumber(e, "marginBottom")} showButtons min={0} suffix=" mm" />
            </div>
            <div className="col-6 field">
              <label className="text-sm font-semibold text-700">Kiri</label>
              <InputNumber value={dataAdjust.marginLeft} onValueChange={(e) => onInputChangeNumber(e, "marginLeft")} showButtons min={0} suffix=" mm" />
            </div>
            <div className="col-6 field">
              <label className="text-sm font-semibold text-700">Kanan</label>
              <InputNumber value={dataAdjust.marginRight} onValueChange={(e) => onInputChangeNumber(e, "marginRight")} showButtons min={0} suffix=" mm" />
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6">
          <h6 className="font-bold border-bottom-1 pb-2 border-300">Konfigurasi Halaman</h6>
          <div className="field mt-3">
            <label className="text-sm font-semibold text-700">Ukuran Kertas</label>
            <Dropdown value={dataAdjust.paperSize} options={paperSizes} onChange={(e) => onInputChange(e, "paperSize")} optionLabel="name" />
          </div>
          <div className="field mt-3">
            <label className="text-sm font-semibold text-700">Orientasi</label>
            <Dropdown value={dataAdjust.orientation} options={orientationOptions} onChange={(e) => onInputChange(e, "orientation")} />
          </div>
        </div>
      </div>
    </Dialog>
  );
}