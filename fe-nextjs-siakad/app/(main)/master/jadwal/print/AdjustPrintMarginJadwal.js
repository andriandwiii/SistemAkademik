"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Definisikan semua kolom yang BISA dipilih
const allColumnOptions = [
  { name: "Kode Jadwal", value: "KODE_JADWAL", dataKey: "KODE_JADWAL" },
  { name: "Hari", value: "hari.HARI", dataKey: "hari.HARI" },
  { name: "Tingkatan", value: "tingkatan.TINGKATAN", dataKey: "tingkatan.TINGKATAN" },
  { name: "Jurusan", value: "jurusan.NAMA_JURUSAN", dataKey: "jurusan.NAMA_JURUSAN" },
  { name: "Kelas", value: "kelas.KELAS_ID", dataKey: "kelas.KELAS_ID" },
  { name: "Guru", value: "guru.NAMA_GURU", dataKey: "guru.NAMA_GURU" },
  { name: "NIP Guru", value: "guru.NIP", dataKey: "guru.NIP" },
  { name: "Mata Pelajaran", value: "mata_pelajaran.NAMA_MAPEL", dataKey: "mata_pelajaran.NAMA_MAPEL" },
  { name: "Jam Ke", value: "jam_pelajaran.JP_KE", dataKey: "jam_pelajaran.JP_KE" },
  { name: "Waktu", value: "waktu", dataKey: "waktu" }, // Ini adalah field kustom
];

// 2. Definisikan kolom default yang terpilih
const defaultSelectedColumns = [
  "hari.HARI",
  "kelas.KELAS_ID",
  "guru.NAMA_GURU",
  "mata_pelajaran.NAMA_MAPEL",
  "waktu",
];

// 3. Opsi Kertas
const paperSizes = [
  { name: "A4", value: "A4" },
  { name: "F4", value: [210, 330] }, // Ukuran F4 dalam mm
  { name: "Letter", value: "Letter" },
];

const orientationOptions = [
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" },
];

// 4. Komponen Utama
export default function AdjustPrintMarginJadwal({
  adjustDialog,
  setAdjustDialog,
  jadwalToPrint,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
  // ===========================================
  // VVVV TERIMA PROPS BARU DARI INDUK VVVV
  namaKurikulum,
  nipKurikulum,
  // ===========================================
}) {
  const [config, setConfig] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "landscape",
    selectedColumns: defaultSelectedColumns,
  });

  const onChangeNumber = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onChangeSelect = (e, name) => {
    setConfig((prev) => ({ ...prev, [name]: e.value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.paperSize,
    });

    // ... (Logika Header PDF, Tabel, dll. biarkan sama) ...
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);
    const mB = parseFloat(config.marginBottom);

    let currentY = mT;

    // --- Header PDF ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("JADWAL PELAJARAN", pageWidth / 2, currentY, {
      align: "center",
    });
    
    currentY += 6;
    doc.setFontSize(14);
    doc.text(
      "SEKOLAH MENENGAH ATAS NEGERI 1 MADIUN",
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    
    currentY += 6;
    const tahunPelajaran = new Date().getFullYear();
    doc.setFontSize(12);
    doc.text(
      `TAHUN PELAJARAN ${tahunPelajaran}/${tahunPelajaran + 1}`,
      pageWidth / 2,
      currentY,
      { align: "center" }
    );

    currentY += 8;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(mL, currentY, pageWidth - mR, currentY);
    currentY += 8;

    // --- Logika Tabel ---
    const tableColumn = config.selectedColumns.map((colValue) => {
      const colConfig = allColumnOptions.find((c) => c.value === colValue);
      return { header: colConfig.name, dataKey: colConfig.dataKey };
    });

    const tableRows = jadwalToPrint.map((jadwal) => {
      const getNestedValue = (obj, path) => {
          const keys = path.split('.');
          return keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : "-", obj);
      }
      const row = {};
      config.selectedColumns.forEach(colKey => {
           if (colKey === "waktu") {
             row.waktu =
               jadwal.jam_pelajaran?.WAKTU_MULAI &&
               jadwal.jam_pelajaran?.WAKTU_SELESAI
                 ? `${jadwal.jam_pelajaran.WAKTU_MULAI} - ${jadwal.jam_pelajaran.WAKTU_SELESAI}`
                 : "-";
           } else {
             row[colKey] = getNestedValue(jadwal, colKey);
           }
      });
      return row;
    });

    autoTable(doc, {
      startY: currentY,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      // ... (styles, headStyles, dll. biarkan sama) ...
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${
            doc.internal.getCurrentPageInfo().pageNumber
          } dari ${pageCount}`,
          pageWidth - mR,
          pageHeight - 5,
          { align: "right" }
        );
      },
    });

    // --- BLOK TANDA TANGAN (TTD) ---
    const finalY = doc.lastAutoTable.finalY;
    const ttdX = pageWidth - mR - 70;
    let ttdY = finalY + 15;

    if (ttdY > pageHeight - mB - 40) {
      doc.addPage();
      ttdY = mT;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const today = new Date();
    const ttdDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.text(`Madiun, ${ttdDate}`, ttdX, ttdY);
    doc.text("Waka. Kurikulum,", ttdX, ttdY + 6);
    
    ttdY += 24;
    doc.text("(..............................)", ttdX, ttdY);

    // ========================================================
    // VVVV PERUBAHAN UTAMA: GUNAKAN PROPS DINAMIS VVVV
    doc.setFont("helvetica", "bold");
    // Gunakan prop 'namaKurikulum', beri fallback jika kosong
    doc.text(namaKurikulum || "(Nama Waka Kurikulum)", ttdX, ttdY + 6);
    
    doc.setFont("helvetica", "normal");
    // Gunakan prop 'nipKurikulum', beri fallback jika kosong
    // (Jika NIP tidak ada di tabel users, Anda bisa hapus prop ini
    // dan biarkan NIP dummy, atau kirim string kosong)
    doc.text(`NIP: ${nipKurikulum || ".............................."}`, ttdX, ttdY + 12); 
    // ========================================================
    // --- AKHIR BLOK TTD ---

    return doc;
  };

  const handleGenerate = () => {
    if (!jadwalToPrint || jadwalToPrint.length === 0) {
      alert("Tidak ada data jadwal untuk dicetak.");
      return;
    }

    const doc = generatePDF();
    const pdfDataUrl = doc.output("datauristring");
    const fileName = "Laporan_Jadwal_Pelajaran.pdf";

    setPdfUrl(pdfDataUrl);
    setFileName(fileName);
    setJsPdfPreviewOpen(true);
    setAdjustDialog(false);
  };

  const footer = () => (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        onClick={() => setAdjustDialog(false)}
      />
      <Button
        label="Generate Preview"
        icon="pi pi-eye"
        severity="primary"
        onClick={handleGenerate}
      />
    </div>
  );

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Print Jadwal Pelajaran"
      style={{ width: "50vw" }}
      modal
      footer={footer}
    >
      <div className="mb-3">
        {/* ... (Isi Dialog biarkan sama) ... */}
        <p className="text-sm text-gray-600">
          Anda akan mencetak{" "}
          <strong>{jadwalToPrint.length} data jadwal</strong>. Silakan pilih
          kolom yang ingin Anda sertakan dan atur margin kertas.
        </p>
      </div>

      <div className="grid p-fluid">
        {/* ... (Field Ukuran Kertas, Orientasi, Kolom, Margin biarkan sama) ... */}
        <div className="col-12">
          <h6 className="mb-3">Pengaturan Cetak</h6>
        </div>

        <div className="col-12 md:col-6">
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

        <div className="col-12 md:col-6">
          <div className="field">
            <label>Orientasi Kertas</label>
            <Dropdown
              value={config.orientation}
              options={orientationOptions}
              onChange={(e) => onChangeSelect(e, "orientation")}
            />
            <small className="text-gray-500">
              Landscape (horizontal) disarankan.
            </small>
          </div>
        </div>
        
        <div className="col-12">
           <div className="field">
             <label>Pilih Kolom yang Akan Dicetak</label>
             <MultiSelect
               value={config.selectedColumns}
               options={allColumnOptions}
               onChange={(e) => onChangeSelect(e, "selectedColumns")}
               optionLabel="name"
               optionValue="value"
               placeholder="Pilih kolom"
               className="w-full"
             />
           </div>
          </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label>Margin Atas & Kiri (mm)</label>
            <div className="grid">
              <div className="col-6">
                <InputNumber
                  value={config.marginTop}
                  onChange={(e) => onChangeNumber(e, "marginTop")}
                  min={5} max={30}
                  suffix=" mm"
                  placeholder="Top"
                />
              </div>
              <div className="col-6">
                <InputNumber
                  value={config.marginLeft}
                  onChange={(e) => onChangeNumber(e, "marginLeft")}
                  min={5} max={30}
                  suffix=" mm"
                  placeholder="Left"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 md:col-6">
          <div className="field">
            <label>Margin Bawah & Kanan (mm)</label>
            <div className="grid">
              <div className="col-6">
                <InputNumber
                  value={config.marginBottom}
                  onChange={(e) => onChangeNumber(e, "marginBottom")}
                  min={5} max={30}
                  suffix=" mm"
                  placeholder="Bottom"
                />
              </div>
              <div className="col-6">
                <InputNumber
                  value={config.marginRight}
                  onChange={(e) => onChangeNumber(e, "marginRight")}
                  min={5} max={30}
                  suffix=" mm"
                  placeholder="Right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}