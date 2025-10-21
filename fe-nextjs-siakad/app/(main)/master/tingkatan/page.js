'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import ToastNotifier from '../../../components/ToastNotifier'
import CustomDataTable from '../../../components/DataTable'
import FormTingkatan from './components/FormTingkatan'
import dynamic from 'next/dynamic'

// 🔹 Import komponen print (dinamis tanpa SSR)
const PDFViewer = dynamic(() => import('./print/PDFViewer'), { ssr: false })
const AdjustPrintMarginLaporan = dynamic(
  () => import('./print/AdjustPrintMarginLaporan'),
  { ssr: false }
)

export default function MasterTingkatanPage() {
  const toastRef = useRef(null)
  const [tingkatanList, setTingkatanList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dialogMode, setDialogMode] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  const [adjustDialog, setAdjustDialog] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false)

  // 🔸 State margin & print setting
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

  // 🔹 Ambil data saat token tersedia
  useEffect(() => {
    if (!token) window.location.href = '/'
    else fetchTingkatan()
  }, [token])

  // 🔹 Fetch data dari API
  const fetchTingkatan = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setTingkatanList(json.data || [])
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Gagal memuat data tingkatan')
    } finally {
      setLoading(false)
    }
  }

  // 🔍 Search filter (client-side)
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    if (!keyword) {
      fetchTingkatan()
    } else {
      const filtered = tingkatanList.filter(
        (t) =>
          t.TINGKATAN_ID?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.TINGKATAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.STATUS?.toLowerCase().includes(keyword.toLowerCase())
      )
      setTingkatanList(filtered)
    }
  }

  // 💾 Save handler (add / edit)
  const handleSave = async (data) => {
    setLoading(true)
    try {
      if (dialogMode === 'add') {
        await fetch(`${API_URL}/master-tingkatan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
        toastRef.current?.showToast('00', 'Tingkatan berhasil ditambahkan')
      } else if (dialogMode === 'edit' && selectedItem) {
        await fetch(`${API_URL}/master-tingkatan/${selectedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
        toastRef.current?.showToast('00', 'Tingkatan berhasil diperbarui')
      }

      fetchTingkatan()
      setDialogMode(null)
      setSelectedItem(null)
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Terjadi kesalahan saat menyimpan tingkatan')
    } finally {
      setLoading(false)
    }
  }

  // ❌ Delete handler
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus tingkatan "${row.TINGKATAN}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true)
        try {
          await fetch(`${API_URL}/master-tingkatan/${row.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          toastRef.current?.showToast('00', 'Tingkatan berhasil dihapus')
          fetchTingkatan()
        } catch (err) {
          console.error(err)
          toastRef.current?.showToast('01', 'Gagal menghapus tingkatan')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // 🧩 Kolom tabel
  const columns = [
    { field: 'id', header: 'ID', style: { width: '60px', textAlign: 'center' } },
    { field: 'TINGKATAN_ID', header: 'Kode Tingkatan', style: { width: '180px' } },
    { field: 'TINGKATAN', header: 'Tingkatan', style: { width: '150px' } },
    { field: 'STATUS', header: 'Status', style: { width: '120px' } },
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

      <h3 className="text-xl font-semibold mb-4">Master Tingkatan</h3>

      {/* 🔹 Toolbar atas: Print | Search | Tambah */}
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
            placeholder="Cari kode atau tingkatan..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Tingkatan"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode('add')
            setSelectedItem(null)
          }}
        />
      </div>

      {/* 🔹 Tabel Data */}
      <CustomDataTable data={tingkatanList} loading={loading} columns={columns} />

      {/* 🔹 Form Input/Edit */}
      <FormTingkatan
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null)
          setSelectedItem(null)
        }}
        selectedTingkatan={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Dialog Pengaturan Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTingkatan={tingkatanList}
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
        header="Preview Laporan Tingkatan"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  )
}
