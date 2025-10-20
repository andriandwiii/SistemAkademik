'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import HeaderBar from '@/app/components/headerbar';
import FormKelas from './components/FormKelas';
import AdjustPrintMarginLaporanKelas from './print/AdjustPrintMarginLaporanKelas';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Load PDFViewer secara dinamis hanya di client-side (sudah benar)
const PDFViewer = dynamic(() => import('./print/PDFViewer'), {
  ssr: false,
  loading: () => <p>Memuat preview...</p>,
});

export default function KelasPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState('');

  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);

  // KUNCI 1: State untuk filter dan search dipisahkan
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tingkatanOptions, setTingkatanOptions] = useState([]);

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

  // Fetch data kelas
  const fetchData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const sorted = res.data.data.sort((a, b) => b.KELAS_ID - a.KELAS_ID);
      setOriginalData(sorted);

      const tingkatanSet = new Set(sorted.map((d) => d.TINGKATAN).filter(Boolean));
      setTingkatanOptions([
        { label: 'Semua Tingkatan', value: null }, // Tambah opsi untuk reset filter
        ...Array.from(tingkatanSet).map((t) => ({ label: `Tingkatan ${t}`, value: t })),
      ]);
    } catch (err) {
      console.error('Gagal ambil data kelas:', err);
      toastRef.current?.showToast('01', 'Gagal memuat data kelas');
    } finally {
      setIsLoading(false);
    }
  };

  // KUNCI 2: Logika filter digabung dalam satu tempat menggunakan useMemo
  // Ini memastikan search dan filter tingkatan bisa bekerja bersamaan tanpa bentrok
  const filteredData = useMemo(() => {
    let data = [...originalData];

    // Terapkan filter pencarian
    if (searchKeyword) {
      const lowercasedKeyword = searchKeyword.toLowerCase();
      data = data.filter(
        (k) =>
          k.NAMA_RUANG?.toLowerCase().includes(lowercasedKeyword) ||
          k.TINGKATAN?.toLowerCase().includes(lowercasedKeyword) ||
          k.NAMA_JURUSAN?.toLowerCase().includes(lowercasedKeyword) ||
          k.NAMA_GEDUNG?.toLowerCase().includes(lowercasedKeyword)
      );
    }

    // Terapkan filter tingkatan
    if (tingkatanFilter) {
      data = data.filter((k) => k.TINGKATAN === tingkatanFilter);
    }

    return data;
  }, [originalData, searchKeyword, tingkatanFilter]);

  // Simpan (Tambah/Edit)
  const handleSubmit = async (data) => {
    try {
      if (selectedKelas) {
        await axios.put(`${API_URL}/master-kelas/${selectedKelas.KELAS_ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Kelas berhasil diperbarui');
      } else {
        await axios.post(`${API_URL}/master-kelas`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Kelas baru berhasil ditambahkan');
      }
      fetchData(token);
      setDialogVisible(false);
      setSelectedKelas(null);
    } catch (err) {
      console.error('Gagal simpan kelas:', err);
      toastRef.current?.showToast('01', 'Gagal menyimpan data kelas');
    }
  };

  // Edit
  const handleEdit = (row) => {
    setSelectedKelas(row);
    setDialogVisible(true);
  };

  // Hapus
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus kelas "${row.NAMA_RUANG}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-kelas/${row.KELAS_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast('00', 'Kelas berhasil dihapus');
          fetchData(token);
        } catch (err) {
          toastRef.current?.showToast('01', 'Gagal menghapus kelas');
        }
      },
    });
  };

  // Kolom tabel
  const columns = useMemo(() => [
    { field: 'KELAS_ID', header: 'ID', sortable: true },
    { field: 'NAMA_RUANG', header: 'Nama Kelas', sortable: true },
    { field: 'TINGKATAN', header: 'Tingkatan', sortable: true },
    { field: 'NAMA_JURUSAN', header: 'Jurusan', sortable: true },
    { field: 'NAMA_GEDUNG', header: 'Gedung', sortable: true },
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
  ], []);

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Kelas</h3>

      {/* KUNCI 3: Perbaikan struktur JSX dan tata letak filter */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-3">
        <Dropdown
          value={tingkatanFilter}
          options={tingkatanOptions}
          onChange={(e) => setTingkatanFilter(e.value)}
          placeholder="Filter berdasarkan tingkatan"
          className="w-full md:w-auto"
        />
        <div className="flex items-center w-full md:w-auto">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-4"
            tooltip="Atur & Cetak Laporan"
            onClick={() => setAdjustDialog(true)} // Langsung buka dialog, data sudah terfilter
          />
          <HeaderBar
            title=""
            placeholder="Cari kelas..."
            onSearch={setSearchKeyword} // Langsung update state search
            onAddClick={() => {
              setSelectedKelas(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      <CustomDataTable data={filteredData} columns={columns} loading={isLoading} />

      <FormKelas
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedKelas(null);
        }}
        onSave={handleSubmit}
        selectedKelas={selectedKelas}
        token={token}
      />

      <AdjustPrintMarginLaporanKelas
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKelas={filteredData} // Kirim data yang sudah terfilter untuk dicetak
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: '90vw', height: '90vh' }}
        header="Preview Laporan Kelas"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}