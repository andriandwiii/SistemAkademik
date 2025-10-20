'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ToastNotifier from '../../../../components/ToastNotifier';

export default function LaporanKeuanganPage() {
  const toastRef = useRef(null);

  const [laporan, setLaporan] = useState([
    { id: 1, tanggal: '2025-09-01', deskripsi: 'SPP Bulan September', pemasukan: 5000000, pengeluaran: 0 },
    { id: 2, tanggal: '2025-09-05', deskripsi: 'Pembelian Alat Tulis', pemasukan: 0, pengeluaran: 750000 },
    { id: 3, tanggal: '2025-09-10', deskripsi: 'Donasi Alumni', pemasukan: 2500000, pengeluaran: 0 },
  ]);

  const [dateRange, setDateRange] = useState(null);

  const filteredData = laporan.filter((item) => {
    if (!dateRange || dateRange.length < 2) return true;
    const [start, end] = dateRange;
    const itemDate = new Date(item.tanggal);
    return itemDate >= start && itemDate <= end;
  });

  // Format currency
  const formatCurrency = (value) =>
    value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Keuangan', 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [['Tanggal', 'Deskripsi', 'Pemasukan', 'Pengeluaran']],
      body: filteredData.map((item) => [
        item.tanggal,
        item.deskripsi,
        formatCurrency(item.pemasukan),
        formatCurrency(item.pengeluaran),
      ]),
    });

    doc.save('laporan_keuangan.pdf');
    toastRef.current?.showToast('00', 'Laporan berhasil diexport ke PDF');
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Tanggal: item.tanggal,
        Deskripsi: item.deskripsi,
        Pemasukan: item.pemasukan,
        Pengeluaran: item.pengeluaran,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
    XLSX.writeFile(workbook, 'laporan_keuangan.xlsx');
    toastRef.current?.showToast('00', 'Laporan berhasil diexport ke Excel');
  };

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Laporan Keuangan</h3>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-3">
        <Calendar
          value={dateRange}
          onChange={(e) => setDateRange(e.value)}
          selectionMode="range"
          readOnlyInput
          placeholder="Filter berdasarkan tanggal"
          className="w-full md:w-3"
        />
        <Button label="Export PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPDF} />
        <Button label="Export Excel" icon="pi pi-file-excel" severity="success" onClick={exportExcel} />
      </div>

      {/* DataTable */}
      <DataTable value={filteredData} paginator rows={10} stripedRows responsiveLayout="scroll">
        <Column field="tanggal" header="Tanggal" style={{ minWidth: '120px' }} />
        <Column field="deskripsi" header="Deskripsi" style={{ minWidth: '200px' }} />
        <Column
          field="pemasukan"
          header="Pemasukan"
          body={(row) => formatCurrency(row.pemasukan)}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="pengeluaran"
          header="Pengeluaran"
          body={(row) => formatCurrency(row.pengeluaran)}
          style={{ minWidth: '150px' }}
        />
      </DataTable>

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
