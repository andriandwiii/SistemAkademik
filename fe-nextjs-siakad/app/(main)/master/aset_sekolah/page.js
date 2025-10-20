'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import HeaderBar from '@/app/components/headerbar';
import FilterTanggal from '@/app/components/filterTanggal';
import FormAset from './components/formDialogAset';
import AdjustPrintMarginLaporanAset from './print/AdjustPrintMarginLaporanAset';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PDFViewer = dynamic(() => import('./print/PDFViewer'), { ssr: false });

export default function AsetPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState('');

  const [dataAset, setDataAset] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedAset, setSelectedAset] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // Ambil token & data awal
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/';
    } else {
      setToken(t);
      fetchData(t);
    }
  }, []);

  // Fetch data aset
  const fetchData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-aset-sekolah`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const sorted = res.data.data.sort((a, b) => b.ASET_ID - a.ASET_ID);
      setDataAset(sorted);
      setOriginalData(sorted);
    } catch (err) {
      console.error('Gagal ambil data aset:', err);
      toastRef.current?.showToast('01', 'Gagal memuat data aset');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 Searching
  const handleSearch = (keyword) => {
    if (!keyword) {
      setDataAset(originalData);
    } else {
      const filtered = originalData.filter(
        (a) =>
          a.NAMA_ASET.toLowerCase().includes(keyword.toLowerCase()) ||
          a.KODE_ASET.toLowerCase().includes(keyword.toLowerCase()) ||
          a.JENIS_ASET.toLowerCase().includes(keyword.toLowerCase())
      );
      setDataAset(filtered);
    }
  };

  // 📅 Filter berdasarkan tanggal pembelian
  const handleDateFilter = () => {
    if (!startDate && !endDate) return setDataAset(originalData);
    const filtered = originalData.filter((item) => {
      const purchaseDate = new Date(item.TANGGAL_PEMBELIAN);
      const from = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const to = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
      return (!from || purchaseDate >= from) && (!to || purchaseDate <= to);
    });
    setDataAset(filtered);
  };

  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDataAset(originalData);
  };

  // 💾 Simpan (Tambah/Edit)
  const handleSubmit = async (data) => {
    try {
      if (selectedAset) {
        await axios.put(`${API_URL}/master-aset-sekolah/${selectedAset.ASET_ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Aset berhasil diperbarui');
      } else {
        await axios.post(`${API_URL}/master-aset-sekolah`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Aset baru berhasil ditambahkan');
      }
      fetchData(token);
      setDialogVisible(false);
      setSelectedAset(null);
    } catch (err) {
      console.error('Gagal simpan aset:', err);
      toastRef.current?.showToast('01', 'Gagal menyimpan data aset');
    }
  };

  // ✏️ Edit data aset
  const handleEdit = (row) => {
    setSelectedAset(row);
    setDialogVisible(true);
  };

  // ❌ Hapus aset
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus aset "${row.NAMA_ASET}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-aset-sekolah/${row.ASET_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast('00', 'Aset berhasil dihapus');
          fetchData(token);
        } catch (err) {
          console.error('Gagal hapus aset:', err);
          toastRef.current?.showToast('01', 'Gagal menghapus aset');
        }
      },
    });
  };

  // Kolom tabel
  const columns = [
    { field: 'ASET_ID', header: 'ID' },
    { field: 'KODE_ASET', header: 'Kode Aset' },
    { field: 'NAMA_ASET', header: 'Nama Aset' },
    { field: 'JENIS_ASET', header: 'Jenis' },
    { field: 'JUMLAH', header: 'Jumlah' },
    { field: 'KONDISI', header: 'Kondisi' },
    {
      field: 'GEDUNG_ID',
      header: 'Gedung',
      body: (row) => row.gedung?.NAMA_GEDUNG || '-',
    },
    { field: 'SUMBER_DANA', header: 'Sumber Dana' },
    {
      field: 'TANGGAL_PEMBELIAN',
      header: 'Tanggal Pembelian',
      body: (row) =>
        row.TANGGAL_PEMBELIAN
          ? new Date(row.TANGGAL_PEMBELIAN).toLocaleDateString('id-ID')
          : '-',
    },
    {
      field: 'HARGA_SATUAN',
      header: 'Harga Satuan',
      body: (row) =>
        row.HARGA_SATUAN?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
    },
    {
      field: 'TOTAL_HARGA',
      header: 'Total Harga',
      body: (row) =>
        row.TOTAL_HARGA?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
    },
    { field: 'STATUS', header: 'Status' },
    { field: 'KETERANGAN', header: 'Keterangan' },
    {
      header: 'Aksi',
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => handleEdit(row)} />
          <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: '120px' },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Aset Sekolah</h3>

      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4">
        <FilterTanggal
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleDateFilter={handleDateFilter}
          resetFilter={resetFilter}
        />
      <div className="flex items-center justify-end">
        <Button
          icon="pi pi-print"
          className="p-button-warning mt-3"
          tooltip="Atur Print Margin"
          onClick={() => {
            handleDateFilter();
            setAdjustDialog(true);
          }}
        />
          <HeaderBar
            title=""
            placeholder="Cari aset berdasarkan kode, nama, atau jenis"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedAset(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      <CustomDataTable data={dataAset} columns={columns} loading={isLoading} />

      <FormAset
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedAset(null);
        }}
        onSave={handleSubmit}
        selectedAset={selectedAset}
        token={token}
      />

      <AdjustPrintMarginLaporanAset
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataAset={dataAset}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: '90vw', height: '90vh' }}
        header="Preview Laporan Aset"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}
