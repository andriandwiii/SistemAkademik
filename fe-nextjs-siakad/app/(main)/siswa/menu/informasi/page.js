"use client";

import { useState } from "react";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

export default function InformasiPage() {
  // Contoh data informasi
  const [informasi] = useState([
    {
      id: 1,
      judul: "Pengumuman Ujian Tengah Semester",
      deskripsi:
        "UTS akan dilaksanakan mulai tanggal 10 Oktober 2025. Harap seluruh siswa menyiapkan diri.",
      kategori: "Akademik",
      tanggal: "2025-09-22",
    },
    {
      id: 2,
      judul: "Kegiatan Pramuka",
      deskripsi:
        "Kegiatan pramuka wajib diikuti oleh seluruh siswa kelas X pada hari Sabtu, 27 September 2025.",
      kategori: "Ekstrakurikuler",
      tanggal: "2025-09-20",
    },
    {
      id: 3,
      judul: "Libur Maulid Nabi",
      deskripsi:
        "Sekolah akan diliburkan pada tanggal 15 Oktober 2025 dalam rangka Maulid Nabi Muhammad SAW.",
      kategori: "Umum",
      tanggal: "2025-09-18",
    },
    {
      id: 4,
      judul: "Try Out UTBK",
      deskripsi:
        "Try Out UTBK online akan dilaksanakan pada 5 November 2025 untuk kelas XII.",
      kategori: "Akademik",
      tanggal: "2025-09-25",
    },
  ]);

  // Warna untuk kategori
  const KATEGORI_SEVERITY = {
    AKADEMIK: "info",
    EKSTRAKURIKULER: "success",
    UMUM: "warn",
  };

  const getSeverity = (kategori) => {
    return KATEGORI_SEVERITY[kategori.toUpperCase()] || null;
  };

  // Format tanggal
  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Header DataView
  const renderHeader = () => (
    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
      <div className="flex align-items-center">
        <i className="pi pi-megaphone text-2xl text-primary mr-3"></i>
        <h2 className="m-0 text-900">Informasi Sekolah</h2>
      </div>
      <Tag
        value={`${informasi.length} Informasi`}
        className="mt-3 md:mt-0"
        severity="secondary"
      />
    </div>
  );

  // Template untuk item
  const itemTemplate = (item) => {
    return (
      <div className="col-12 md:col-6">
        <Card className="mb-4 shadow-2 border-round-xl surface-card h-full">
          <div className="p-4 flex flex-column justify-between h-full">
            <div>
              <div className="flex justify-content-between align-items-start mb-3">
                <h3 className="text-xl font-semibold text-900">{item.judul}</h3>
                <Tag
                  value={item.kategori}
                  severity={getSeverity(item.kategori)}
                  className="text-sm font-medium"
                />
              </div>
              <p className="text-700 line-height-3 mb-3">{item.deskripsi}</p>
            </div>

            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mt-3 pt-2 border-top-1 surface-border">
              <div className="flex align-items-center text-sm text-500">
                <i className="pi pi-calendar mr-2 text-primary"></i>
                <span>{formatTanggal(item.tanggal)}</span>
              </div>
              <Button
                label="Baca Selengkapnya"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="p-button-outlined p-button-sm"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="surface-section p-4 md:p-6">
      <div className="mx-auto">
        <DataView
          value={informasi}
          itemTemplate={itemTemplate}
          header={renderHeader()}
          layout="grid"
          rows={6}
        />
      </div>
    </div>
  );
}
