/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useEffect, useState } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import CustomDataTable from '../../../components/DataTable'; 
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

/**
 * DashboardKeuangan
 * - Ringkasan finansial
 * - Chart pemasukan vs pengeluaran (line)
 * - Pie chart rincian pengeluaran
 * - Tabel transaksi terbaru
 * - Tabel piutang / tagihan tertunggak
 * - Export CSV / Cetak
 */

const DashboardKeuangan = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const toast = useRef(null);

  // --- contoh data (dummy) ---
  const summary = {
    totalIncomeMonth: 125000000, // IDR
    totalExpenseMonth: 82000000,
    cashOnHand: 43000000,
    outstandingReceivables: 15000000,
  };

  // data line: pemasukan & pengeluaran per minggu (atau per hari)
  const lineData = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Pemasukan',
        data: [30000000, 35000000, 28000000, 32000000],
        fill: false,
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        tension: 0.3,
      },
      {
        label: 'Pengeluaran',
        data: [20000000, 22000000, 18000000, 22000000],
        fill: false,
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0.3,
      },
    ],
  };

  const expenseBreakdown = {
    labels: ['Gaji', 'Listrik & Air', 'Pemeliharaan', 'Alat Tulis', 'Lainnya'],
    datasets: [
      {
        data: [45, 15, 12, 10, 18],
        backgroundColor: ['#0ea5a4', '#60a5fa', '#f97316', '#a78bfa', '#f59e0b'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' },
      },
    },
    scales: {
      x: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
      y: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
    },
  };

  // transaksi terbaru
  const [transactions, setTransactions] = useState([
    { id: 1, tanggal: '2025-09-22', jenis: 'Pemasukan', deskripsi: 'SPP Kelas XI', jumlah: 5000000, sumber: 'Siswa' },
    { id: 2, tanggal: '2025-09-21', jenis: 'Pengeluaran', deskripsi: 'Gaji Guru', jumlah: 25000000, sumber: 'Bank' },
    { id: 3, tanggal: '2025-09-20', jenis: 'Pengeluaran', deskripsi: 'Listrik', jumlah: 1500000, sumber: 'Cash' },
    { id: 4, tanggal: '2025-09-19', jenis: 'Pemasukan', deskripsi: 'Donasi Komite', jumlah: 10000000, sumber: 'Komite' },
  ]);

  // piutang / tagihan tertunggak
  const [receivables, setReceivables] = useState([
    { id: 1, nama: 'Siswa A', kelas: 'XI IPA 2', amount: 2000000, dueDate: '2025-09-30' },
    { id: 2, nama: 'Siswa B', kelas: 'X IPS 1', amount: 3500000, dueDate: '2025-10-05' },
  ]);

  // filter / search
  const [globalFilter, setGlobalFilter] = useState('');
  const [period, setPeriod] = useState('Bulan Ini');
  const periodOptions = ['Bulan Ini', 'Triwulan', 'Tahun'];

  // helper: format rupiah
  const formatIDR = (n) =>
    n == null ? '-' : n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  // Export CSV helper
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

  // Cetak ringkasan (print window)
  const handlePrintSummary = () => {
    window.print();
  };

  // Actions pada transaksi (contoh edit/hapus)
  const handleDeleteTransaction = (row) => {
    confirmDialog({
      message: `Hapus transaksi "${row.deskripsi}" (${formatIDR(row.jumlah)}) ?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== row.id));
        toast.current?.show({ severity: 'success', summary: 'Dihapus', detail: 'Transaksi dihapus' });
      },
    });
  };

  const actionTransTemplate = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => toast.current?.show({ severity: 'info', summary: 'Edit', detail: `Implement edit for id ${row.id}` })} />
      <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDeleteTransaction(row)} />
    </div>
  );

  // columns for CustomDataTable (compatible with your CustomDataTable signature)
  const transactionsColumns = [
    { field: 'id', header: 'ID', style: { width: '60px' } },
    { field: 'tanggal', header: 'Tanggal' },
    { field: 'jenis', header: 'Jenis' },
    { field: 'deskripsi', header: 'Deskripsi' },
    { field: 'jumlah', header: 'Jumlah', body: (r) => formatIDR(r.jumlah) },
    { field: 'sumber', header: 'Sumber' },
    { header: 'Aksi', body: actionTransTemplate, style: { width: '120px' } },
  ];

  const receivablesColumns = [
    { field: 'id', header: 'ID', style: { width: '60px' } },
    { field: 'nama', header: 'Nama' },
    { field: 'kelas', header: 'Kelas' },
    { field: 'amount', header: 'Jumlah', body: (r) => formatIDR(r.amount) },
    { field: 'dueDate', header: 'Jatuh Tempo' },
    {
      header: 'Aksi',
      body: (r) => (
        <div className="flex gap-2">
          <Button icon="pi pi-check" size="small" severity="success" onClick={() => {
            // tandai lunas (contoh)
            setReceivables(prev => prev.filter(x => x.id !== r.id));
            toast.current?.show({ severity: 'success', summary: 'Lunas', detail: `${r.nama} dibayar` });
          }} />
          <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => {
            confirmDialog({
              message: `Hapus piutang ${r.nama}?`,
              header: 'Konfirmasi',
              icon: 'pi pi-exclamation-triangle',
              accept: () => setReceivables(prev => prev.filter(x => x.id !== r.id))
            });
          }} />
        </div>
      ),
      style: { width: '120px' },
    },
  ];

  // fallback: use Prime DataTable if CustomDataTable not found
  const useCustom = !!CustomDataTable;

  return (
    <div className="grid">
      <Toast ref={toast} />

      {/* Summary cards */}
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-2">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium mb-2">Total Pemasukan (Bulan)</span>
              <div className="text-900 font-medium text-xl">{formatIDR(summary.totalIncomeMonth)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-wallet text-green-600 text-xl" />
            </div>
          </div>
          <small className="text-500">Pendapatan dari SPP, donasi, dll.</small>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-2">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium mb-2">Total Pengeluaran (Bulan)</span>
              <div className="text-900 font-medium text-xl">{formatIDR(summary.totalExpenseMonth)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-shopping-cart text-red-600 text-xl" />
            </div>
          </div>
          <small className="text-500">Gaji, utilities, operasional.</small>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-2">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium mb-2">Kas Tersisa</span>
              <div className="text-900 font-medium text-xl">{formatIDR(summary.cashOnHand)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-bank text-blue-600 text-xl" />
            </div>
          </div>
          <small className="text-500">Saldo kas & rekening</small>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-2">
          <div className="flex justify-content-between">
            <div>
              <span className="block text-500 font-medium mb-2">Piutang</span>
              <div className="text-900 font-medium text-xl">{formatIDR(summary.outstandingReceivables)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-clock text-orange-600 text-xl" />
            </div>
          </div>
          <small className="text-500">Tagihan belum diterima</small>
        </div>
      </div>

      {/* Controls + period */}
      <div className="col-12">
        <div className="card mb-2">
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-3">
              <InputText placeholder="Cari..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
              <Dropdown value={period} options={periodOptions} onChange={(e) => setPeriod(e.value)} placeholder="Periode" />
            </div>

            <div className="flex gap-2">
              <Button label="Export CSV (Transaksi)" icon="pi pi-file" onClick={() => exportCSV(transactions, 'transaksi.csv')} />
              <Button label="Export CSV (Piutang)" icon="pi pi-file" onClick={() => exportCSV(receivables, 'piutang.csv')} />
              <Button label="Cetak Ringkasan" icon="pi pi-print" onClick={handlePrintSummary} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="col-12 md:col-7">
        <div className="card">
          <h5>Pemasukan vs Pengeluaran ({period})</h5>
          <Chart type="line" data={lineData} options={chartOptions} />
        </div>
      </div>

      <div className="col-12 md:col-5">
        <div className="card">
          <h5>Rincian Pengeluaran</h5>
          <Chart type="pie" data={expenseBreakdown} options={chartOptions} />
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5>Transaksi Terbaru</h5>
            <div>
              <Button label="Tambah Transaksi" icon="pi pi-plus" onClick={() => toast.current?.show({ severity: 'info', summary: 'Tambah', detail: 'Form tambah transaksi' })} />
            </div>
          </div>

          {useCustom ? (
            <CustomDataTable data={transactions} loading={false} columns={transactionsColumns} />
          ) : (
            <DataTable value={transactions} paginator rows={10} className="text-sm">
              <Column field="tanggal" header="Tanggal" />
              <Column field="jenis" header="Jenis" />
              <Column field="deskripsi" header="Deskripsi" />
              <Column field="jumlah" header="Jumlah" body={(r) => formatIDR(r.jumlah)} />
              <Column field="sumber" header="Sumber" />
              <Column header="Aksi" body={actionTransTemplate} style={{ width: '120px' }} />
            </DataTable>
          )}
        </div>
      </div>

      {/* Piutang/Tunggakan */}
      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5>Piutang / Tagihan Tertunggak</h5>
            <small className="text-500">{receivables.length} tagihan</small>
          </div>

          {useCustom ? (
            <CustomDataTable data={receivables} loading={false} columns={receivablesColumns} />
          ) : (
            <DataTable value={receivables} paginator rows={10} className="text-sm">
              <Column field="nama" header="Nama" />
              <Column field="kelas" header="Kelas" />
              <Column field="amount" header="Jumlah" body={(r) => formatIDR(r.amount)} />
              <Column field="dueDate" header="Jatuh Tempo" />
              <Column header="Aksi" body={(r) => (
                <div className="flex gap-2">
                  <Button icon="pi pi-check" size="small" severity="success" onClick={() => {
                    setReceivables(prev => prev.filter(x => x.id !== r.id));
                    toast.current?.show({ severity: 'success', summary: 'Lunas', detail: `${r.nama} dibayar` });
                  }} />
                  <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => {
                    confirmDialog({
                      message: `Hapus piutang ${r.nama}?`,
                      header: 'Konfirmasi',
                      icon: 'pi pi-exclamation-triangle',
                      accept: () => setReceivables(prev => prev.filter(x => x.id !== r.id))
                    });
                  }} />
                </div>
              )} />
            </DataTable>
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default DashboardKeuangan;
