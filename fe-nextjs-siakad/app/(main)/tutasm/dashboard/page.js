/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useContext, useRef } from "react";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { LayoutContext } from "../../../../layout/context/layoutcontext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CustomDataTable from "../../../components/DataTable";

const DashboardTUTAS = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const dt = useRef(null);

  // Summary cards
  const summaryCards = [
    {
      title: "Absen Siswa Hari Ini",
      value: "95%",
      icon: "pi pi-users",
      color: "bg-green-100 text-green-500",
    },
    {
      title: "Absen Guru Hari Ini",
      value: "92%",
      icon: "pi pi-id-card",
      color: "bg-blue-100 text-blue-500",
    },
    {
      title: "Agenda Guru",
      value: "7 Jadwal",
      icon: "pi pi-calendar",
      color: "bg-purple-100 text-purple-500",
    },
    {
      title: "Surat Masuk",
      value: "5",
      icon: "pi pi-envelope",
      color: "bg-orange-100 text-orange-500",
    },
  ];

  // Chart absensi siswa
  const siswaAttendanceData = {
    labels: ["Hadir", "Sakit", "Izin", "Alpa"],
    datasets: [
      {
        data: [320, 25, 15, 10],
        backgroundColor: ["#22c55e", "#3b82f6", "#facc15", "#ef4444"],
      },
    ],
  };

  // Chart absensi guru
  const guruAttendanceData = {
    labels: ["Hadir", "Izin", "Alpa"],
    datasets: [
      {
        data: [45, 3, 2],
        backgroundColor: ["#16a34a", "#facc15", "#ef4444"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: layoutConfig.colorScheme === "light" ? "#495057" : "#ebedef",
        },
      },
    },
  };

  // Data absensi siswa
  const siswaHariIni = [
    { nama: "Andi", kelas: "XI IPA 1", status: "Hadir" },
    { nama: "Siti", kelas: "XI IPA 1", status: "Sakit" },
    { nama: "Budi", kelas: "XI IPA 2", status: "Hadir" },
    { nama: "Nina", kelas: "XI IPS 1", status: "Izin" },
  ];

  // Kolom absensi siswa
  const siswaColumns = [
    { field: "nama", header: "Nama" },
    { field: "kelas", header: "Kelas" },
    { field: "status", header: "Status" },
  ];

  // Data agenda guru
  const agendaGuru = [
    { guru: "Pak Budi", jam: "07:00 - 08:30", mataPelajaran: "Matematika" },
    { guru: "Bu Sari", jam: "08:30 - 10:00", mataPelajaran: "Bahasa Indonesia" },
    { guru: "Pak Andi", jam: "10:15 - 11:45", mataPelajaran: "Fisika" },
    { guru: "Bu Ratna", jam: "12:30 - 14:00", mataPelajaran: "Sejarah" },
  ];

  // Kolom agenda guru
  const agendaColumns = [
    { field: "guru", header: "Guru" },
    { field: "jam", header: "Jam" },
    { field: "mataPelajaran", header: "Mata Pelajaran" },
  ];

  // Export PDF
    const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Absensi Siswa Hari Ini", 14, 16);

    autoTable(doc, {
        startY: 20,
        head: [siswaColumns.map((col) => col.header)],
        body: siswaHariIni.map((s) => siswaColumns.map((col) => s[col.field])),
    });

    doc.save("absensi-siswa.pdf");
    };

  return (
    <div className="grid">
      {/* Summary Cards */}
      {summaryCards.map((card, i) => (
        <div key={i} className="col-12 md:col-6 xl:col-3">
          <div className="card mb-0">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  {card.title}
                </span>
                <div className="text-900 font-medium text-xl">{card.value}</div>
              </div>
              <div
                className={`flex align-items-center justify-content-center ${card.color} border-round`}
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className={`${card.icon} text-xl`} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Chart Kehadiran */}
      <div className="col-12 md:col-6">
        <div className="card">
          <h5>Kehadiran Siswa</h5>
          <Chart type="doughnut" data={siswaAttendanceData} options={chartOptions} />
        </div>
      </div>

      <div className="col-12 md:col-6">
        <div className="card">
          <h5>Kehadiran Guru</h5>
          <Chart type="pie" data={guruAttendanceData} options={chartOptions} />
        </div>
      </div>

      {/* Tabel Absensi Siswa */}
      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5>Absensi Siswa Hari Ini</h5>
            <div className="flex gap-2">
              <Button
                type="button"
                icon="pi pi-file-pdf"
                label="Export PDF"
                className="p-button-danger p-button-sm"
                onClick={exportPDF}
              />
            </div>
          </div>
          <CustomDataTable data={siswaHariIni} columns={siswaColumns} />
        </div>
      </div>

      {/* Agenda Guru */}
      <div className="col-12">
        <div className="card">
          <h5>Agenda Guru Hari Ini</h5>
          <CustomDataTable data={agendaGuru} columns={agendaColumns} />
        </div>
      </div>
    </div>
  );
};

export default DashboardTUTAS;
