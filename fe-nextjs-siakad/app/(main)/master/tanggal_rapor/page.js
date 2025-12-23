'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

// Import komponen pendukung
import ToastNotifier from '../../../components/ToastNotifier'
import CustomDataTable from '../../../components/DataTable'
import FormTanggal from './components/FormTanggal'
import AdjustPrintMarginTanggal from './print/AdjustPrintMarginTanggal'
import JsPdfPreview from './print/PDFViewer' // Jika Anda punya komponen preview PDF

export default function TanggalRaporPage() {
  const toastRef = useRef(null)
  
  // States
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dialogMode, setDialogMode] = useState(null) // 'add' atau 'edit'
  const [searchKeyword, setSearchKeyword] = useState('')

  // States untuk Export PDF/Excel
  const [adjustDialog, setAdjustDialog] = useState(false)
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 20,
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    paperSize: 'A4',
    orientation: 'portrait',
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  useEffect(() => {
    if (!token) {
      window.location.href = '/'
    } else {
      fetchData()
    }
  }, [token])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/tanggal-rapor`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setDataList(json.data || [])
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  // Fungsi tambahan untuk memfilter data berdasarkan keyword pencarian
  const getFilteredData = () => {
    if (!searchKeyword) return dataList
    const lower = searchKeyword.toLowerCase()
    return dataList.filter(item => 
      item.SEMESTER?.toLowerCase().includes(lower) || 
      item.TEMPAT_CETAK?.toLowerCase().includes(lower)
    )
  }

  const handleSave = async (data) => {
    setLoading(true)
    try {
      const isAdd = dialogMode === 'add'
      // Pastikan ID menggunakan huruf besar sesuai database
      const url = isAdd 
        ? `${API_URL}/tanggal-rapor` 
        : `${API_URL}/tanggal-rapor/${selectedItem.ID}` 
      
      const res = await fetch(url, {
        method: isAdd ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()

      if (res.ok) {
        toastRef.current?.showToast('00', `Berhasil ${isAdd ? 'ditambah' : 'diperbarui'}`)
        fetchData()
        setDialogMode(null)
        setSelectedItem(null)
      } else {
        // Tampilkan pesan error spesifik dari backend (seperti error format tanggal atau duplikat)
        toastRef.current?.showToast('01', responseData.message || 'Gagal menyimpan')
      }
    } catch (err) {
      toastRef.current?.showToast('01', 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (row) => {
    confirmDialog({
      message: `Hapus data tanggal rapor semester "${row.SEMESTER}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true)
        try {
          const res = await fetch(`${API_URL}/tanggal-rapor/${row.ID}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            toastRef.current?.showToast('00', 'Berhasil dihapus')
            fetchData()
          } else {
            const errorData = await res.json()
            toastRef.current?.showToast('01', errorData.message || 'Gagal menghapus')
          }
        } catch (err) {
          toastRef.current?.showToast('01', 'Gagal menghapus')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // Template Tampilan Preview TTD di Tabel (Sesuai Gambar 71)
  const ttdTemplate = (rowData, type) => {
    const isKepsek = type === 'kepsek'
    return (
      <div className="text-xs p-2 border-1 surface-border border-round bg-gray-50" style={{ lineHeight: '1.2' }}>
        {isKepsek ? (
          <>
            Mengetahui<br />
            {rowData.TULISAN_KS || 'Kepala Sekolah'}<br /><br /><br />
            <b>Nama Kepala Sekolah</b><br />
            {rowData.NIP_KEPSEK_LABEL || 'NIP.'} xxxxxxxxxxxxxxxxxx
          </>
        ) : (
          <>
            {rowData.TEMPAT_CETAK || '...'}, {rowData.TANGGAL_CETAK || '...'}<br />
            Wali Kelas<br /><br /><br />
            <b>Nama Wali Kelas</b><br />
            {rowData.NIP_WALAS_LABEL || 'NIP.'} xxxxxxxxxxxxxxxxxx
          </>
        )}
      </div>
    )
  }

  const columns = [
    { 
        header: 'Data Tanggal Rapor', 
        body: (r) => (
          <div className="text-sm">
            <b>Semester:</b> {r.SEMESTER} <br/>
            <b>Tanggal:</b> {r.TANGGAL_CETAK} <br/>
            <b>Tempat:</b> {r.TEMPAT_CETAK} <br/>
            <b>Semester Ke:</b> {r.SEMESTER_KE}
          </div>
        )
    },
    { header: 'Contoh Tampilan TTD Wali Kelas', body: (r) => ttdTemplate(r, 'walas') },
    { header: 'Contoh Tampilan TTD Kepsek', body: (r) => ttdTemplate(r, 'kepsek') },
    {
      header: 'Aksi',
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" severity="warning" rounded size="small" 
            onClick={() => { setSelectedItem(row); setDialogMode('edit'); }} />
          <Button icon="pi pi-trash" severity="danger" rounded size="small" 
            onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="text-xl font-semibold m-0">Referensi Tanggal Rapor</h3>
        <div className="flex gap-2">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                  value={searchKeyword} 
                  onChange={(e) => setSearchKeyword(e.target.value)} 
                  placeholder="Cari semester..." 
                  className="p-inputtext-sm"
                />
            </span>
            <Button label="Cetak" icon="pi pi-print" severity="secondary" 
              onClick={() => setAdjustDialog(true)} />
            <Button label="Tambah Tanggal" icon="pi pi-plus" severity="info" 
              onClick={() => { setDialogMode('add'); setSelectedItem(null); }} />
        </div>
      </div>

      <CustomDataTable data={getFilteredData()} loading={loading} columns={columns} />

      {/* Form Dialog */}
      <FormTanggal
        visible={dialogMode !== null}
        onHide={() => { setDialogMode(null); setSelectedItem(null); }}
        selectedData={selectedItem}
        onSave={handleSave}
      />

      {/* Dialog Pengaturan Cetak (Marginal) */}
      <AdjustPrintMarginTanggal
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTanggal={dataList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* Preview PDF */}
      <JsPdfPreview
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        pdfUrl={pdfUrl}
        fileName={fileName}
      />
    </div>
  )
}