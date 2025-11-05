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
  const [config, setConfig] = useState({
    jumlahPertemuan: 20,
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

  // Fetch siswa berdasarkan kelas dari jadwal
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
    const mL = parseFloat(config.marginLeft);
    const mT = parseFloat(config.marginTop);
    const mR = parseFloat(config.marginRight);
    const mB = parseFloat(config.marginBottom);

    let currentY = mT;

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
    doc.text("ABSENSI DAFTAR HADIR SISWA", pageWidth / 2, currentY + 5, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.text(
      "SEKOLAH MENENGAH ATAS NEGERI 1 MADIUN",
      pageWidth / 2,
      currentY + 12,
      { align: "center" }
    );

    const tahunPelajaran = new Date().getFullYear();
    doc.setFontSize(12);
    doc.text(
      `TAHUN PELAJARAN ${tahunPelajaran}/${tahunPelajaran + 1}`,
      pageWidth / 2,
      currentY + 19,
      { align: "center" }
    );

    currentY += 25;

    // Garis pemisah
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(mL, currentY, pageWidth - mR, currentY);

    currentY += 5;

    // Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const infoLeft = [
      { label: "Mata Pelajaran", value: jadwalData?.mata_pelajaran?.NAMA_MAPEL || "-" },
      { label: "Nama Guru Bidang Study", value: jadwalData?.guru?.NAMA_GURU || "-" },
    ];

    const infoRight = [
      { 
        label: "Kelas", 
        value: `${jadwalData?.tingkatan?.TINGKATAN || ""} ${jadwalData?.jurusan?.NAMA_JURUSAN || ""} ${jadwalData?.kelas?.KELAS_ID || ""}`.trim() 
      },
      { label: "Tahun pelajaran", value: `${tahunPelajaran}/${tahunPelajaran + 1}` },
    ];

    infoLeft.forEach((info, idx) => {
      doc.text(info.label, mL, currentY + (idx * 6));
      doc.text(":", mL + 50, currentY + (idx * 6));
      doc.text(info.value, mL + 55, currentY + (idx * 6));
    });

    infoRight.forEach((info, idx) => {
      doc.text(info.label, pageWidth / 2 + 20, currentY + (idx * 6));
      doc.text(":", pageWidth / 2 + 60, currentY + (idx * 6));
      doc.text(info.value, pageWidth / 2 + 65, currentY + (idx * 6));
    });

    currentY += 18;

    // Tabel
    const pertemuanColumns = Array.from(
      { length: config.jumlahPertemuan },
      (_, i) => (i + 1).toString()
    );

    const tableColumn = [
      { header: "No.", dataKey: "no" },
      { header: "Nama Peserta Didik", dataKey: "nama" },
      ...pertemuanColumns.map((p) => ({ header: p, dataKey: `p${p}` })),
    ];

    const tableRows = siswaList.map((siswa, idx) => {
      const row = {
        no: idx + 1,
        nama: siswa.siswa?.NAMA || "-",
      };
      pertemuanColumns.forEach((p) => {
        row[`p${p}`] = "";
      });
      return row;
    });

    autoTable(doc, {
      startY: currentY,
      columns: tableColumn,
      body: tableRows,
      margin: { left: mL, right: mR, bottom: mB },
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineWidth: 0.3,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      columnStyles: {
        no: { cellWidth: 10, halign: "center" },
        nama: { cellWidth: 50, halign: "left" },
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
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
          pageWidth - mR - 20,
          doc.internal.pageSize.height - 5,
          { align: "right" }
        );
      },
    });

    return doc;
  };

  const handleGenerate = () => {
    if (siswaList.length === 0) {
      alert("Tidak ada siswa di kelas ini");
      return;
    }

    const doc = generatePDF();
    const pdfDataUrl = doc.output("datauristring");
    const fileName = `Daftar_Hadir_${jadwalData?.mata_pelajaran?.NAMA_MAPEL || "Absensi"}_${jadwalData?.kelas?.KELAS_ID || ""}.pdf`;

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
      header={`Pengaturan Print - ${jadwalData?.mata_pelajaran?.NAMA_MAPEL || "Absensi"}`}
      style={{ width: "50vw" }}
      modal
      footer={footer}
    >
      <div className="mb-3">
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
          <h6 className="mb-3">Pengaturan Print</h6>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label>Jumlah Pertemuan / Kolom Tanggal</label>
            <InputNumber
              value={config.jumlahPertemuan}
              onChange={(e) => onChangeNumber(e, "jumlahPertemuan")}
              min={10}
              max={30}
              showButtons
              suffix=" pertemuan"
            />
            <small className="text-gray-500">
              Jumlah kolom untuk absensi (10-30 pertemuan)
            </small>
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
              Landscape (horizontal) disarankan untuk banyak pertemuan
            </small>
          </div>
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
            <label>Margin (mm)</label>
            <div className="grid">
              <div className="col-6">
                <InputNumber
                  value={config.marginTop}
                  onChange={(e) => onChangeNumber(e, "marginTop")}
                  min={5}
                  max={30}
                  suffix=" mm"
                  placeholder="Top"
                />
              </div>
              <div className="col-6">
                <InputNumber
                  value={config.marginLeft}
                  onChange={(e) => onChangeNumber(e, "marginLeft")}
                  min={5}
                  max={30}
                  suffix=" mm"
                  placeholder="Left"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-3">
          <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: "2rem" }}></i>
          <p className="text-sm text-gray-600 mt-2">Memuat data siswa...</p>
        </div>
      )}
    </Dialog>
  );
}