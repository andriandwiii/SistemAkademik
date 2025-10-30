'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import HeaderBar from '@/app/components/headerbar';
import FormJamPelajaran from './components/FormJamPelajaran';
import AdjustPrintMarginLaporan from './print/AdjustPrintMarginLaporan';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PDFViewer = dynamic(() => import('./print/PDFViewer'), { ssr: false, loading: () => <p>Memuat preview...</p> });

export default function MasterJamPelajaranPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState('');
  const [jamList, setJamList] = useState([]);
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
    if (!t) window.location.href = '/';
    else {
      setToken(t);
      fetchData(t);
    }
  }, []);

  const fetchData = async (t) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-jam-pelajaran`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setJamList(res.data.data.sort((a, b) => a.ID - b.ID));
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal memuat data jam pelajaran');
    } finally {
      setLoading(false);
    }
  };

  // Filter pencarian
  const filteredData = useMemo(() => {
    if (!searchKeyword) return jamList;
    const lower = searchKeyword.toLowerCase();
    return jamList.filter(
      (j) =>
        j.KODE_JP?.toLowerCase().includes(lower) ||
        j.DESKRIPSI?.toLowerCase().includes(lower)
    );
  }, [jamList, searchKeyword]);

  // Simpan (Add / Edit)
  const handleSave = async (data) => {
    try {
      if (selectedItem) {
        await axios.put(`${API_URL}/master-jam-pelajaran/${selectedItem.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Jam pelajaran berhasil diperbarui');
      } else {
        await axios.post(`${API_URL}/master-jam-pelajaran`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toastRef.current?.showToast('00', 'Jam pelajaran berhasil ditambahkan');
      }
      fetchData(token);
      setDialogVisible(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal menyimpan jam pelajaran');
    }
  };

  // Edit
  const handleEdit = (row) => {
    setSelectedItem(row);
    setDialogVisible(true);
  };

  // Hapus
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus Jam Pelajaran ID: ${row.ID}?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-jam-pelajaran/${row.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast('00', 'Jam pelajaran berhasil dihapus');
          fetchData(token);
        } catch {
          toastRef.current?.showToast('01', 'Gagal menghapus jam pelajaran');
        }
      },
    });
  };

  // Kolom tabel
  const columns = [
    { field: 'ID', header: 'ID', style: { width: '60px', textAlign: 'center' } },
    { field: 'KODE_JP', header: 'Kode JP', style: { width: '120px' } },
    { field: 'JP_KE', header: 'JP Ke', style: { width: '80px', textAlign: 'center' } },
    { field: 'WAKTU_MULAI', header: 'Jam Mulai', style: { width: '100px', textAlign: 'center' } },
    { field: 'WAKTU_SELESAI', header: 'Jam Selesai', style: { width: '100px', textAlign: 'center' } },
    { field: 'DURASI', header: 'Durasi (menit)', style: { width: '120px', textAlign: 'center' } },
    { field: 'DESKRIPSI', header: 'Deskripsi', style: { width: '180px' } },
    {
      header: 'Aksi',
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => handleEdit(row)} />
          <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: '120px', textAlign: 'center' },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Jam Pelajaran</h3>

      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button
          icon="pi pi-print"
          severity="warning"
          tooltip="Atur & Cetak Laporan"
          onClick={() => setAdjustDialog(true)}
        />

        <HeaderBar
          title=""
          placeholder="Cari jam pelajaran..."
          onSearch={setSearchKeyword}
          onAddClick={() => {
            setSelectedItem(null);
            setDialogVisible(true);
          }}
        />
      </div>

      <CustomDataTable data={filteredData} loading={loading} columns={columns} />

      <FormJamPelajaran
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
        onSave={handleSave}
      />

      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataJadwal={filteredData} // gunakan data jam pelajaran
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
        header="Preview Laporan Jam Pelajaran"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
