'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import ToastNotifier from '../../../components/ToastNotifier'
import CustomDataTable from '../../../components/DataTable'
import FormRuang from './components/FormRuang'
import dynamic from 'next/dynamic'

// 🔹 Import komponen print (dinamis tanpa SSR)
const PDFViewer = dynamic(() => import('./print/PDFViewer'), { ssr: false })
const AdjustPrintMarginLaporan = dynamic(
  () => import('./print/AdjustPrintMarginLaporan'),
  { ssr: false }
)

export default function MasterRuangPage() {
  const toastRef = useRef(null)
  const [ruangList, setRuangList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dialogMode, setDialogMode] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  const [adjustDialog, setAdjustDialog] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false)

  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: 'A4',
    orientation: 'portrait',
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  // 🔹 Fetch data saat token tersedia
  useEffect(() => {
    if (!token) window.location.href = '/'
    else fetchRuang()
  }, [token])

  // 🔹 Fetch data dari API
  const fetchRuang = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/master-ruang`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setRuangList(json.data || [])
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Gagal memuat data ruang')
    } finally {
      setLoading(false)
    }
  }

  // 🔍 Pencarian client-side
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    if (!keyword) {
      fetchRuang()
    } else {
      const filtered = ruangList.filter(
        (r) =>
          r.RUANG_ID?.toLowerCase().includes(keyword.toLowerCase()) ||
          r.NAMA_RUANG?.toLowerCase().includes(keyword.toLowerCase()) ||
          r.DESKRIPSI?.toLowerCase().includes(keyword.toLowerCase())
      )
      setRuangList(filtered)
    }
  }

  // 💾 Simpan data (add / edit)
  const handleSave = async (data) => {
    setLoading(true)
    try {
      if (dialogMode === 'add') {
        await fetch(`${API_URL}/master-ruang`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
        toastRef.current?.showToast('00', 'Ruang berhasil ditambahkan')
      } else if (dialogMode === 'edit' && selectedItem) {
        await fetch(`${API_URL}/master-ruang/${selectedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
        toastRef.current?.showToast('00', 'Ruang berhasil diperbarui')
      }

      fetchRuang()
      setDialogMode(null)
      setSelectedItem(null)
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Terjadi kesalahan saat menyimpan ruang')
    } finally {
      setLoading(false)
    }
  }

  // ❌ Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus ruang "${row.NAMA_RUANG}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true)
        try {
          await fetch(`${API_URL}/master-ruang/${row.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          toastRef.current?.showToast('00', 'Ruang berhasil dihapus')
          fetchRuang()
        } catch (err) {
          console.error(err)
          toastRef.current?.showToast('01', 'Gagal menghapus ruang')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // 🧩 Kolom tabel
  const columns = [
    { field: 'id', header: 'ID', style: { width: '60px', textAlign: 'center' } },
    { field: 'RUANG_ID', header: 'Kode Ruang', style: { width: '180px' } },
    { field: 'NAMA_RUANG', header: 'Nama Ruang', style: { minWidth: '200px' } },
    { field: 'DESKRIPSI', header: 'Deskripsi', style: { minWidth: '250px' } },
    {
      header: 'Actions',
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedItem(row)
              setDialogMode('edit')
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: '120px' },
    },
  ]

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">Master Ruang</h3>

      {/* 🔹 Toolbar: Print | Search | Tambah */}
      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button
          icon="pi pi-print"
          severity="warning"
          onClick={() => setAdjustDialog(true)}
        />

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari kode, nama, atau deskripsi..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Ruang"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode('add')
            setSelectedItem(null)
          }}
        />
      </div>

      {/* 🔹 Tabel Data */}
      <CustomDataTable data={ruangList} loading={loading} columns={columns} />

      {/* 🔹 Form Input/Edit */}
      <FormRuang
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null)
          setSelectedItem(null)
        }}
        selectedRuang={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Dialog Pengaturan Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataRuang={ruangList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: '90vw', height: '90vh' }}
        header="Preview Laporan Ruang"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  )
}
