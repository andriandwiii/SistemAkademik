/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import CustomDataTable from '../../../components/DataTable';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const DashboardBPBK = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const toast = useRef(null);

  // === Dummy summary ===
  const summary = {
    totalAbsensi: 1280,
    totalPelanggaran: 25,
    totalKonseling: 12,
    siswaBermasalah: 8,
  };

  // === Chart data ===
  const trendPelanggaran = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Jumlah Pelanggaran',
        data: [5, 8, 6, 6],
        fill: false,
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0.3,
      },
    ],
  };

  const distribusiPelanggaran = {
    labels: ['Terlambat', 'Seragam', 'Perilaku', 'Bolos', 'Lainnya'],
    datasets: [
      {
        data: [40, 25, 15, 10, 10],
        backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#f59e0b'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { labels: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
    },
    scales: {
      x: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
      y: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
    },
  };

  // === Data tables ===
  const [catatanBK, setCatatanBK] = useState([
    { id: 1, nama: 'Siswa A', kelas: 'XI IPA 1', catatan: 'Sering terlambat', tanggal: '2025-09-20' },
    { id: 2, nama: 'Siswa B', kelas: 'X IPS 2', catatan: 'Bolos pelajaran', tanggal: '2025-09-18' },
    { id: 3, nama: 'Siswa C', kelas: 'XI IPA 3', catatan: 'Tidak memakai seragam', tanggal: '2025-09-17' },
  ]);

  const catatanColumns = [
    { field: 'id', header: 'ID', style: { width: '60px' } },
    { field: 'nama', header: 'Nama' },
    { field: 'kelas', header: 'Kelas' },
    { field: 'catatan', header: 'Catatan' },
    { field: 'tanggal', header: 'Tanggal' },
    {
      header: 'Aksi',
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => toast.current?.show({ severity: 'info', summary: 'Edit', detail: `Edit catatan ${row.nama}` })} />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() =>
              confirmDialog({
                message: `Hapus catatan untuk ${row.nama}?`,
                header: 'Konfirmasi',
                icon: 'pi pi-exclamation-triangle',
                accept: () => setCatatanBK((prev) => prev.filter((c) => c.id !== row.id)),
              })
            }
          />
        </div>
      ),
    },
  ];

  // === Export CSV helper ===
  const exportCSV = (rows, filename = 'export.csv') => {
    if (!rows || rows.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Kosong', detail: 'Tidak ada data untuk diexport' });
      return;
    }

    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(','),
      ...rows.map((r) => keys.map((k) => `"${(r[k] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  };

  // === UI ===
  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Summary Cards */}
      {[
        { label: 'Total Absensi', value: summary.totalAbsensi, icon: 'pi pi-users', color: 'green' },
        { label: 'Pelanggaran', value: summary.totalPelanggaran, icon: 'pi pi-exclamation-triangle', color: 'red' },
        { label: 'Sesi Konseling', value: summary.totalKonseling, icon: 'pi pi-comments', color: 'blue' },
        { label: 'Siswa Bermasalah', value: summary.siswaBermasalah, icon: 'pi pi-user-minus', color: 'orange' },
      ].map((c, i) => (
        <div key={i} className="col-12 lg:col-6 xl:col-3">
          <div className="card mb-2">
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">{c.label}</span>
                <div className="text-900 font-medium text-xl">{c.value}</div>
              </div>
              <div
                className={`flex align-items-center justify-content-center bg-${c.color}-100 border-round`}
                style={{ width: '3rem', height: '3rem' }}
              >
                <i className={`pi ${c.icon} text-${c.color}-600 text-xl`} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Charts */}
      <div className="col-12 md:col-7">
        <div className="card">
          <h5>Tren Pelanggaran</h5>
          <Chart type="line" data={trendPelanggaran} options={chartOptions} />
        </div>
      </div>

      <div className="col-12 md:col-5">
        <div className="card">
          <h5>Distribusi Jenis Pelanggaran</h5>
          <Chart type="pie" data={distribusiPelanggaran} options={chartOptions} />
        </div>
      </div>

      {/* Catatan BK */}
      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5>Catatan BK Terbaru</h5>
            <Button label="Export CSV" icon="pi pi-file" onClick={() => exportCSV(catatanBK, 'catatan-bk.csv')} />
          </div>

          {CustomDataTable ? (
            <CustomDataTable data={catatanBK} loading={false} columns={catatanColumns} />
          ) : (
            <DataTable value={catatanBK} paginator rows={10}>
              <Column field="nama" header="Nama" />
              <Column field="kelas" header="Kelas" />
              <Column field="catatan" header="Catatan" />
              <Column field="tanggal" header="Tanggal" />
              <Column header="Aksi" body={(row) => (
                <div className="flex gap-2">
                  <Button icon="pi pi-pencil" size="small" severity="warning" />
                  <Button icon="pi pi-trash" size="small" severity="danger" />
                </div>
              )} />
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBPBK;
