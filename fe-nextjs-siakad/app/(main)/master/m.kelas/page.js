'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import HeaderBar from '@/app/components/headerbar';
import FormKelas from './components/FormKelas';
import AdjustPrintMarginLaporan from './print/AdjustPrintMarginLaporan';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Viewer PDF (hanya jalan di client)
const PDFViewer = dynamic(() => import('./print/PDFViewer'), {
  ssr: false,
  loading: () => <p>Memuat preview...</p>,
});

export default function MasterKelasPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: 'A4',
    orientation: 'landscape',
  });

  // Ambil token & data
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/';
    } else {
      setToken(t);
      fetchData(t);
    }
  }, []);

  // Ambil data kelas + join gedung & ruang
  const fetchData = async (t) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setKelasList(res.data.data.sort((a, b) => a.ID - b.ID));
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  // Filter pencarian
  const filteredData = useMemo(() => {
    if (!searchKeyword) return kelasList;
    const lower = searchKeyword.toLowerCase();
    return kelasList.filter(
      (k) =>
        k.KELAS_ID?.toLowerCase().includes(lower) ||
        k.NAMA_GEDUNG?.toLowerCase().includes(lower) ||
        k.NAMA_RUANG?.toLowerCase().includes(lower) ||
        k.STATUS?.toLowerCase().includes(lower)
    );
  }, [kelasList, searchKeyword]);

  // Simpan (Add / Edit)
  const handleSave = async (data) => {
    try {
      if (selectedItem) {
        await axios.put(`${API_URL}/master-kelas/${selectedItem.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Kelas berhasil diperbarui');
      } else {
        await axios.post(`${API_URL}/master-kelas`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Kelas berhasil ditambahkan');
      }
      fetchData(token);
      setDialogVisible(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal menyimpan data kelas');
    }
  };

  // Edit data
  const handleEdit = (row) => {
    setSelectedItem(row);
    setDialogVisible(true);
  };

  // Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus kelas ID: ${row.ID}?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-kelas/${row.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast('00', 'Kelas berhasil dihapus');
          fetchData(token);
        } catch {
          toastRef.current?.showToast('01', 'Gagal menghapus kelas');
        }
      },
    });
  };

  // Kolom tabel (tanpa created_at & updated_at)
  const columns = [
    { field: 'ID', header: 'ID', style: { width: '60px', textAlign: 'center' } },
    { field: 'KELAS_ID', header: 'Kode Kelas', style: { width: '120px' } },
    {
      header: 'Nama Gedung',
      body: (row) => row.NAMA_GEDUNG || '-',
      style: { width: '180px' },
    },
    {
      header: 'Nama Ruang',
      body: (row) => row.NAMA_RUANG || '-',
      style: { width: '180px' },
    },
    {
      field: 'STATUS',
      header: 'Status',
      style: { width: '120px', textAlign: 'center' },
    },
    {
      header: 'Aksi',
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => handleEdit(row)}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: '120px', textAlign: 'center' },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Kelas</h3>

      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button
          icon="pi pi-print"
          severity="warning"
          tooltip="Atur & Cetak Laporan"
          onClick={() => setAdjustDialog(true)}
        />

        <HeaderBar
          title=""
          placeholder="Cari kelas..."
          onSearch={setSearchKeyword}
          onAddClick={() => {
            setSelectedItem(null);
            setDialogVisible(true);
          }}
        />
      </div>

      <CustomDataTable data={filteredData} loading={loading} columns={columns} />

      <FormKelas
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedItem(null);
        }}
        selectedKelas={selectedItem}
        onSave={handleSave}
        token={token}
      />

      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKelas={filteredData}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: '90vw', height: '90vh' }}
        header="Preview Laporan Kelas"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
