"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";

export default function AdjustPrintAbsensiGuru({
  visible,
  onHide,
  token, // Token auth jika diperlukan untuk fetch
  setPdfUrl, // State dari parent untuk URL blob PDF
  setFileName, // State dari parent untuk nama file
  setJsPdfPreviewOpen, // State dari parent untuk buka dialog preview
}) {
  const [loading, setLoading] = useState(false);
  
  // State Konfigurasi
  const [config, setConfig] = useState({
    dateRange: null, // [startDate, endDate]
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait", // Default portrait karena list ke bawah
  });

  // Default tanggal: 1 bulan terakhir
  useEffect(() => {
    if (visible && !config.dateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(1); // Awal bulan ini
      setConfig((prev) => ({ ...prev, dateRange: [start, end] }));
    }
  }, [visible]);

  // --- OPSI DROPDOWN ---
  const paperSizes = [
    { name: "A4", value: "A4" },
    { name: "F4", value: [215, 330] }, // Ukuran F4 dalam mm
    { name: "Letter", value: "Letter" },
  ];

  const orientationOptions = [
    { label: "Portrait", value: "portrait" },
    { label: "Landscape", value: "landscape" },
  ];

  // --- HANDLER CHANGE ---
  const onChangeNumber = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onChangeSelect = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value }));
  };

  // --- FETCH DATA ABSENSI ---
  const fetchRekapAbsensi = async () => {
    try {
      if (!config.dateRange || !config.dateRange[0] || !config.dateRange[1]) {
        alert("Harap pilih rentang tanggal terlebih dahulu.");
        return [];
      }

      const start = config.dateRange[0].toISOString().split("T")[0];
      const end = config.dateRange[1].toISOString().split("T")[0];

      // Panggil API rekap yang sudah kita buat sebelumnya
      // Pastikan endpoint ini sesuai dengan backendmu
      const res = await axios.get(`${API_URL}/api/absensi-guru/rekap`, {
        params: { startDate: start, endDate: end },
        // headers: { Authorization: `Bearer ${token}` } // Uncomment jika pakai auth
      });

      if (res.data.status === "success") {
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Gagal mengambil data absensi:", error);
      alert("Gagal mengambil data dari server.");
      return [];
    }
  };

  // --- GENERATE PDF ---
  const generatePDF = (dataAbsensi) => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);
    const mB = parseFloat(config.marginBottom);

    let currentY = mT;

    // --- KOP SURAT (HEADER) ---
    // Logo (Kotak Biru sebagai placeholder)
    doc.setFillColor(41, 128, 185);
    doc.roundedRect(mL, currentY, 15, 15, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("S", mL + 7.5, currentY + 10, { align: "center" });

    // Teks Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PEMERINTAH PROVINSI JAWA TIMUR", pageWidth / 2, currentY + 5, { align: "center" });
    doc.setFontSize(16);
    doc.text("SMK NEGERI 1 RAMBAH", pageWidth / 2, currentY + 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Contoh Alamat No. 123, Kota Madiun", pageWidth / 2, currentY + 17, { align: "center" });

    currentY += 25;
    // Garis pemisah kop
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(mL, currentY, pageWidth - mR, currentY);
    currentY += 5;

    // --- JUDUL LAPORAN ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN REKAPITULASI KEHADIRAN GURU", pageWidth / 2, currentY + 5, { align: "center" });

    // Periode Tanggal
    const startStr = config.dateRange[0].toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const endStr = config.dateRange[1].toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Periode: ${startStr} s.d. ${endStr}`, pageWidth / 2, currentY + 10, { align: "center" });

    currentY += 15;

    // --- TABEL DATA ---
    const tableColumn = [
      { header: "No", dataKey: "no" },
      { header: "Tanggal", dataKey: "tanggal" },
      { header: "Nama Guru", dataKey: "nama" },
      { header: "NIP", dataKey: "nip" },
      { header: "Masuk", dataKey: "masuk" },
      { header: "Pulang", dataKey: "pulang" },
      { header: "Status", dataKey: "status" },
      { header: "Ket", dataKey: "ket" },
    ];

    const tableRows = dataAbsensi.map((item, index) => {
      // Format Tanggal
      const tgl = new Date(item.TANGGAL).toLocaleDateString("id-ID", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      
      // Format Jam (Hanya ambil HH:mm)
      const jamMasuk = item.JAM_MASUK ? item.JAM_MASUK.slice(0, 5) : "-";
      const jamPulang = item.JAM_KELUAR ? item.JAM_KELUAR.slice(0, 5) : "-";

      return {
        no: index + 1,
        tanggal: tgl,
        nama: item.NAMA_GURU || "-",
        nip: item.NIP || "-",
        masuk: jamMasuk,
        pulang: jamPulang,
        status: item.STATUS,
        ket: item.KETERANGAN || (item.TERLAMBAT === 1 ? "Terlambat" : "-"),
      };
    });

    autoTable(doc, {
      startY: currentY,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [220, 220, 220], // Abu-abu muda agar hemat tinta
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        no: { cellWidth: 8, halign: "center" },
        tanggal: { cellWidth: 22, halign: "center" },
        masuk: { cellWidth: 15, halign: "center" },
        pulang: { cellWidth: 15, halign: "center" },
        status: { cellWidth: 15, halign: "center" },
        // Sisanya otomatis
      },
      didDrawPage: (data) => {
        // Nomor Halaman
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
          pageWidth - mR,
          pageHeight - 5,
          { align: "right" }
        );
      },
    });

    // --- TANDA TANGAN (SIGNATURE BLOCK) ---
    const finalY = doc.lastAutoTable.finalY;
    
    // Cek apakah cukup ruang di halaman ini?
    let ttdY = finalY + 10;
    if (ttdY > pageHeight - mB - 40) {
      doc.addPage();
      ttdY = mT;
    }

    const ttdX = pageWidth - mR - 60;
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Madiun, ${todayStr}`, ttdX, ttdY);
    doc.text("Kepala Sekolah,", ttdX, ttdY + 5);

    // Ruang TTD
    ttdY += 25;
    
    doc.setFont("helvetica", "bold");
    doc.text("NAMA KEPALA SEKOLAH", ttdX, ttdY);
    doc.setFont("helvetica", "normal");
    doc.text("NIP. 19800101 200001 1 001", ttdX, ttdY + 5);

    return doc;
  };

  // --- HANDLER TOMBOL GENERATE ---
  const handleGenerate = async () => {
    setLoading(true);
    // 1. Fetch Data
    const data = await fetchRekapAbsensi();
    
    if (data.length === 0) {
      alert("Tidak ada data absensi pada rentang tanggal tersebut.");
      setLoading(false);
      return;
    }

    // 2. Generate PDF
    const doc = generatePDF(data);
    const pdfDataUrl = doc.output("datauristring");
    
    // 3. Set State ke Parent untuk ditampilkan
    const fileName = `Laporan_Absensi_Guru_${config.dateRange[0].toISOString().split('T')[0]}_sd_${config.dateRange[1].toISOString().split('T')[0]}.pdf`;
    
    setPdfUrl(pdfDataUrl);
    setFileName(fileName);
    setJsPdfPreviewOpen(true); // Membuka dialog preview di parent
    onHide(); // Tutup dialog setting ini
    
    setLoading(false);
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        onClick={onHide}
      />
      <Button
        label="Generate Laporan"
        icon="pi pi-print"
        severity="primary"
        onClick={handleGenerate}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Cetak Laporan Absensi Guru"
      style={{ width: "450px" }}
      modal
      footer={footer}
    >
      <div className="grid p-fluid">
        <div className="col-12">
          <p className="mb-3 text-gray-600">
            Pilih periode tanggal untuk mencetak rekapitulasi kehadiran guru.
          </p>
        </div>

        {/* --- FILTER TANGGAL --- */}
        <div className="col-12">
          <div className="field">
            <label className="font-bold">Periode Tanggal</label>
            <Calendar 
              value={config.dateRange} 
              onChange={(e) => setConfig(prev => ({ ...prev, dateRange: e.value }))} 
              selectionMode="range" 
              readOnlyInput 
              hideOnRangeSelection 
              showIcon
              placeholder="Pilih Mulai - Sampai"
            />
          </div>
        </div>

        {/* --- PENGATURAN KERTAS --- */}
        <div className="col-6">
          <div className="field">
            <label>Ukuran Kertas</label>
            <Dropdown
              value={config.paperSize}
              options={paperSizes}
              onChange={(e) => onChangeSelect(e, "paperSize")}
              optionLabel="name"
            />
          </div>
        </div>

        <div className="col-6">
          <div className="field">
            <label>Orientasi</label>
            <Dropdown
              value={config.orientation}
              options={orientationOptions}
              onChange={(e) => onChangeSelect(e, "orientation")}
            />
          </div>
        </div>

        {/* --- MARGIN --- */}
        <div className="col-12">
            <label>Margin (mm)</label>
        </div>
        <div className="col-6">
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon">Atas</span>
                <InputNumber value={config.marginTop} onValueChange={(e) => onChangeNumber(e, "marginTop")} min={0} />
            </div>
        </div>
        <div className="col-6">
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon">Bawah</span>
                <InputNumber value={config.marginBottom} onValueChange={(e) => onChangeNumber(e, "marginBottom")} min={0} />
            </div>
        </div>
        <div className="col-6">
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon">Kiri</span>
                <InputNumber value={config.marginLeft} onValueChange={(e) => onChangeNumber(e, "marginLeft")} min={0} />
            </div>
        </div>
        <div className="col-6">
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon">Kanan</span>
                <InputNumber value={config.marginRight} onValueChange={(e) => onChangeNumber(e, "marginRight")} min={0} />
            </div>
        </div>

      </div>
    </Dialog>
  );
}