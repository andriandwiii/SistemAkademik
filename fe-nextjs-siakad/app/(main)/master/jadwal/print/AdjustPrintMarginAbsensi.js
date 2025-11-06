"use client";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- OPSI UNTUK DROPDOWN ---

// Opsi Tipe Absensi
const modeOptions = [
  { name: "Per Semester (Penuh 6 Bulan)", value: "semester" },
  { name: "Per Jumlah Pertemuan (Manual)", value: "pertemuan" },
];

// Opsi Bulan
const monthOptions = [
  { name: "Januari", value: 1 },
  { name: "Februari", value: 2 },
  { name: "Maret", value: 3 },
  { name: "April", value: 4 },
  { name: "Mei", value: 5 },
  { name: "Juni", value: 6 },
  { name: "Juli", value: 7 },
  { name: "Agustus", value: 8 },
  { name: "September", value: 9 },
  { name: "Oktober", value: 10 },
  { name: "November", value: 11 },
  { name: "Desember", value: 12 },
];

// Opsi Tahun Ajaran (Dibuat dinamis)
const generateTahunAjaranOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let i = -2; i <= 2; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    options.push({ name: `${startYear}/${endYear}`, value: `${startYear}/${endYear}` });
  }
  return options;
};
const tahunAjaranOptions = generateTahunAjaranOptions();

// Opsi Semester
const semesterOptions = [
  { name: "Ganjil (Juli - Desember)", value: 1 },
  { name: "Genap (Januari - Juni)", value: 2 },
];

// Mendapatkan TA dan Semester saat ini
const getCurrentTADanSemester = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  let tahunAjaran;
  let semester;

  if (currentMonth >= 7 && currentMonth <= 12) {
    // Semester Ganjil
    tahunAjaran = `${currentYear}/${currentYear + 1}`;
    semester = 1;
  } else {
    // Semester Genap
    tahunAjaran = `${currentYear - 1}/${currentYear}`;
    semester = 2;
  }
  return [tahunAjaran, semester];
};

/**
 * Helper: Mendapatkan semua tanggal untuk HARI TERTENTU dalam sebulan.
 */
const getDatesForDayInMonth = (year, month, dayName) => {
  const dayMap = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 0,
  };

  const targetDayIndex = dayMap[dayName];
  if (targetDayIndex === undefined) {
    console.error("Nama hari tidak valid:", dayName);
    return [];
  }

  const dates = [];
  const date = new Date(year, month - 1, 1); // month di JS 0-indexed

  while (date.getMonth() === month - 1) {
    if (date.getDay() === targetDayIndex) {
      dates.push(date.getDate().toString());
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

/**
 * Helper: Mendapatkan SEMUA tanggal untuk satu semester (6 bulan)
 */
const getSemesterDates = (tahunAjaran, semester, dayName) => {
  const [startYearStr, endYearStr] = tahunAjaran.split("/");
  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);
  
  const allDateHeaders = [];
  let monthsToIterate = [];

  if (semester === 1) {
    // Ganjil: Juli - Desember
    monthsToIterate = [
      { month: 7, year: startYear }, { month: 8, year: startYear }, { month: 9, year: startYear },
      { month: 10, year: startYear }, { month: 11, year: startYear }, { month: 12, year: startYear },
    ];
  } else {
    // Genap: Januari - Juni
    monthsToIterate = [
      { month: 1, year: endYear }, { month: 2, year: endYear }, { month: 3, year: endYear },
      { month: 4, year: endYear }, { month: 5, year: endYear }, { month: 6, year: endYear },
    ];
  }

  monthsToIterate.forEach(({ month, year }) => {
    const dates = getDatesForDayInMonth(year, month, dayName);
    const monthAbbr = monthOptions[month - 1].name.substring(0, 3).toUpperCase();
    
    dates.forEach(day => {
      allDateHeaders.push({
        header: `${monthAbbr} ${day}`,
        dataKey: `d_${month}_${day}`,
      });
    });
  });

  return allDateHeaders;
};

// --- KOMPONEN UTAMA ---

export default function AdjustPrintMarginAbsensi({
  adjustDialog,
  setAdjustDialog,
  jadwalData,
  token,
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  
  const [defaultTA, defaultSemester] = getCurrentTADanSemester();
  
  const [config, setConfig] = useState({
    mode: 'semester', // Mode default
    jumlahPertemuan: 20, // Default untuk mode 'pertemuan'
    tahunAjaran: defaultTA,
    semester: defaultSemester,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "landscape",
  });

  const paperSizes = [
    { name: "A4", value: "A4" },
    { name: "F4", value: [210, 330] }, 
    { name: "Letter", value: "Letter" },
  ];

  const orientationOptions = [
    { label: "Portrait", value: "portrait" },
    { label: "Landscape", value: "landscape" },
  ];

  useEffect(() => {
    if (adjustDialog && jadwalData?.kelas?.KELAS_ID) {
      fetchSiswaByKelas();
    }
  }, [adjustDialog, jadwalData]);

  const fetchSiswaByKelas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/transaksi-siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "00") {
        const siswaKelas = res.data.data.filter(
          (t) => t.kelas?.KELAS_ID === jadwalData.kelas.KELAS_ID
        );
        siswaKelas.sort((a, b) =>
          (a.siswa?.NAMA || "").localeCompare(b.siswa?.NAMA || "")
        );
        setSiswaList(siswaKelas);
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
    } finally {
      setLoading(false);
    }
  };

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

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);
    const mB = parseFloat(config.marginBottom);

    let currentY = mT;

    // ... (Kode Header, Logo, Garis Pemisah tetap sama) ...
    // Logo
    doc.setFillColor(41, 128, 185);
    doc.roundedRect(mL, currentY, 15, 15, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("S", mL + 7.5, currentY + 10, { align: "center" });
    // Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ABSENSI DAFTAR HADIR SISWA", pageWidth / 2, currentY + 5, { align: "center" });
    doc.setFontSize(14);
    doc.text("SEKOLAH MENENGAH ATAS NEGERI 1 MADIUN", pageWidth / 2, currentY + 12, { align: "center" });

    // Header dinamis berdasarkan Mode
    doc.setFontSize(12);
    if (config.mode === 'semester') {
      const semesterName = semesterOptions.find(s => s.value === config.semester)?.name || "";
      doc.text(
        `TAHUN PELAJARAN ${config.tahunAjaran} - SEMESTER ${semesterName.split(" ")[0].toUpperCase()}`,
        pageWidth / 2, currentY + 19, { align: "center" }
      );
    } else {
      const tahunPelajaran = new Date().getFullYear();
      doc.text(
        `TAHUN PELAJARAN ${tahunPelajaran}/${tahunPelajaran + 1}`,
        pageWidth / 2, currentY + 19, { align: "center" }
      );
    }

    currentY += 25;
    // Garis pemisah
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(mL, currentY, pageWidth - mR, currentY);
    currentY += 5;
    
    // --- Info Kiri & Kanan (Disesuaikan) ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const infoLeft = [
      { label: "Mata Pelajaran", value: jadwalData?.mata_pelajaran?.NAMA_MAPEL || "-" },
      { label: "Nama Guru", value: jadwalData?.guru?.NAMA_GURU || "-" },
    ];

    // Info kanan dinamis berdasarkan mode
    const infoRight = [
      {
        label: "Kelas",
        value:
          `${jadwalData?.tingkatan?.TINGKATAN || ""} ${
            jadwalData?.jurusan?.NAMA_JURUSAN || ""
          } ${jadwalData?.kelas?.KELAS_ID || ""}`.trim() || "-",
      },
      // Info dinamis
      config.mode === 'semester' 
        ? {
            label: "Hari / Jam",
            value: `${jadwalData?.hari?.HARI || "-"} / ${jadwalData?.jam_pelajaran?.WAKTU_MULAI || ""}-${jadwalData?.jam_pelajaran?.WAKTU_SELESAI || ""}`,
          }
        : {
            label: "Jumlah Pertemuan",
            value: `${config.jumlahPertemuan} Pertemuan`,
          }
    ];

    infoLeft.forEach((info, idx) => {
      doc.text(info.label, mL, currentY + idx * 6);
      doc.text(":", mL + 50, currentY + idx * 6);
      doc.text(info.value, mL + 55, currentY + idx * 6);
    });

    infoRight.forEach((info, idx) => {
      doc.text(info.label, pageWidth / 2 + 20, currentY + idx * 6);
      doc.text(":", pageWidth / 2 + 60, currentY + idx * 6);
      doc.text(info.value, pageWidth / 2 + 65, currentY + idx * 6);
    });

    currentY += 18;

    // --- LOGIKA TABEL DINAMIS (Berdasarkan Mode) ---
    let tableColumn;
    let tableRows;
    let dynamicColumnStyles = {};

    if (config.mode === 'semester') {
      // --- Mode SEMESTER (Otomatis) ---
      const targetDayName = jadwalData?.hari?.HARI || "Senin";
      const dateColumns = getSemesterDates(
        config.tahunAjaran,
        config.semester,
        targetDayName
      );

      tableColumn = [
        { header: "No.", dataKey: "no" },
        { header: "Nama Peserta Didik", dataKey: "nama" },
        ...dateColumns,
        { header: "S", dataKey: "s" },
        { header: "I", dataKey: "i" },
        { header: "A", dataKey: "a" },
      ];

      tableRows = siswaList.map((siswa, idx) => {
        const row = { no: idx + 1, nama: siswa.siswa?.NAMA || "-", s: "", i: "", a: "" };
        dateColumns.forEach((col) => {
          row[col.dataKey] = "";
        });
        return row;
      });
      
      dateColumns.forEach(col => {
        dynamicColumnStyles[col.dataKey] = {
          cellWidth: 7, 
          halign: "center",
        };
      });

    } else {
      // --- Mode PER PERTEMUAN (Manual) ---
      const pertemuanColumns = Array.from(
        { length: config.jumlahPertemuan },
        (_, i) => (i + 1).toString()
      );
      
      tableColumn = [
        { header: "No.", dataKey: "no" },
        { header: "Nama Peserta Didik", dataKey: "nama" },
        ...pertemuanColumns.map((p) => ({ header: p, dataKey: `p${p}` })),
        { header: "S", dataKey: "s" },
        { header: "I", dataKey: "i" },
        { header: "A", dataKey: "a" },
      ];

      tableRows = siswaList.map((siswa, idx) => {
        const row = { no: idx + 1, nama: siswa.siswa?.NAMA || "-", s: "", i: "", a: "" };
        pertemuanColumns.forEach((p) => {
          row[`p${p}`] = "";
        });
        return row;
      });

      pertemuanColumns.forEach(p => {
        dynamicColumnStyles[`p${p}`] = {
          cellWidth: 7, 
          halign: "center",
        };
      });
    }
    // --- AKHIR LOGIKA TABEL DINAMIS ---


    autoTable(doc, {
      startY: currentY,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      styles: {
        fontSize: 6, 
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineWidth: 0.3,
        fontSize: 7, 
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      columnStyles: {
        no: { cellWidth: 8, halign: "center", fontSize: 7 },
        nama: { cellWidth: 40, halign: "left", fontSize: 7 },
        ...dynamicColumnStyles, // Terapkan style dinamis (baik mode semester/pertemuan)
        s: { cellWidth: 7, halign: "center", fontStyle: "bold", fontSize: 7 },
        i: { cellWidth: 7, halign: "center", fontStyle: "bold", fontSize: 7 },
        a: { cellWidth: 7, halign: "center", fontStyle: "bold", fontSize: 7 },
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      didDrawCell: (data) => {
        if (data.section === "body" || data.section === "head") {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.1);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        }
      },
      didDrawPage: (data) => {
        // Hanya nomor halaman
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
    let ttdY = finalY + 10; 

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
    doc.text("Guru Mata Pelajaran,", ttdX, ttdY + 6);
    
    ttdY += 24; 
    doc.text("(..............................)", ttdX, ttdY); 

    doc.setFont("helvetica", "bold");
    doc.text(jadwalData?.guru?.NAMA_GURU || "Nama Guru", ttdX, ttdY + 6); 
    
    doc.setFont("helvetica", "normal");
    doc.text(`NIP: ${jadwalData?.guru?.NIP || "-"}`, ttdX, ttdY + 12);
    // --- AKHIR BLOK TTD ---

    return doc;
  };


  const handleGenerate = () => {
    if (siswaList.length === 0) {
      alert("Tidak ada siswa di kelas ini");
      return;
    }

    const doc = generatePDF();
    const pdfDataUrl = doc.output("datauristring");
    const fileName = `Daftar_Hadir_${
      jadwalData?.mata_pelajaran?.NAMA_MAPEL || "Absensi"
    }_${jadwalData?.kelas?.KELAS_ID || ""}.pdf`;

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
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header={`Pengaturan Print - ${
        jadwalData?.mata_pelajaran?.NAMA_MAPEL || "Absensi"
      }`}
      style={{ width: "50vw" }}
      modal
      footer={footer}
    >
      <div className="mb-3">
        {/* ... (Info jadwal tetap sama) ... */}
         <p className="text-sm text-gray-600 mb-2">
           <strong>Mata Pelajaran:</strong> {jadwalData?.mata_pelajaran?.NAMA_MAPEL || "-"}
         </p>
         <p className="text-sm text-gray-600 mb-2">
           <strong>Guru:</strong> {jadwalData?.guru?.NAMA_GURU || "-"}
         </p>
         <p className="text-sm text-gray-600 mb-2">
           <strong>Kelas:</strong>{" "}
           {`${jadwalData?.tingkatan?.TINGKATAN || ""} ${jadwalData?.jurusan?.NAMA_JURUSAN || ""}`.trim() || "-"}
         </p>
         <p className="text-sm text-gray-600 mb-2">
           <strong>Hari:</strong> {jadwalData?.hari?.HARI || "-"}
         </p>
         <p className="text-sm text-gray-600 mb-2">
           <strong>Jam:</strong>{" "}
           {jadwalData?.jam_pelajaran?.WAKTU_MULAI && jadwalData?.jam_pelajaran?.WAKTU_SELESAI
             ? `${jadwalData.jam_pelajaran.WAKTU_MULAI} - ${jadwalData.jam_pelajaran.WAKTU_SELESAI}`
             : "-"}
         </p>
         <p className="text-sm text-gray-600">
           <strong>Jumlah Siswa:</strong> {siswaList.length} siswa
         </p>
      </div>

      <div className="grid p-fluid">
        <div className="col-12">
          <h6 className="mb-3">Pengaturan Cetak Absensi</h6>
        </div>

        {/* --- PILIHAN MODE --- */}
        <div className="col-12">
          <div className="field">
            <label>Tipe Absensi</label>
            <Dropdown
              value={config.mode}
              options={modeOptions}
              onChange={(e) => onChangeSelect(e, "mode")}
              optionLabel="name"
            />
          </div>
        </div>
        
        {/* --- TAMPILKAN JIKA MODE SEMESTER --- */}
        {config.mode === 'semester' && (
          <>
            <div className="col-12 md:col-6">
              <div className="field">
                <label>Tahun Ajaran</label>
                <Dropdown
                  value={config.tahunAjaran}
                  options={tahunAjaranOptions}
                  onChange={(e) => onChangeSelect(e, "tahunAjaran")}
                  optionLabel="name"
                  placeholder="Pilih Tahun Ajaran"
                />
                <small className="text-gray-500">
                  Pilih tahun ajaran (6 bulan).
                </small>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label>Semester</label>
                <Dropdown
                  value={config.semester}
                  options={semesterOptions}
                  onChange={(e) => onChangeSelect(e, "semester")}
                  optionLabel="name"
                  placeholder="Pilih Semester"
                />
                <small className="text-gray-500">
                  Pilih semester (Ganjil/Genap).
                </small>
              </div>
            </div>
          </>
        )}
        
        {/* --- TAMPILKAN JIKA MODE PER PERTEMUAN --- */}
        {config.mode === 'pertemuan' && (
          <div className="col-12 md:col-6">
            <div className="field">
              <label>Jumlah Pertemuan / Kolom Tanggal</label>
              <InputNumber
                value={config.jumlahPertemuan}
                onChange={(e) => onChangeNumber(e, "jumlahPertemuan")}
                min={10}
                max={40} // Meningkatkan maks jika landscape
                showButtons
                suffix=" pertemuan"
              />
              <small className="text-gray-500">
                Jumlah kolom untuk absensi (10-40 pertemuan)
              </small>
            </div>
          </div>
        )}

        {/* --- PENGATURAN KERTAS (TETAP) --- */}
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
              Landscape sangat disarankan untuk mode semester.
            </small>
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

      {loading && (
        <div className="text-center py-3">
          <i
            className="pi pi-spin pi-spinner text-blue-500"
            style={{ fontSize: "2rem" }}
          ></i>
          <p className="text-sm text-gray-600 mt-2">Memuat data siswa...</p>
        </div>
      )}
    </Dialog>
  );
}