'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

// Pastikan path import ini benar sesuai struktur folder Anda
import ToastNotifier from '../../../components/ToastNotifier'
import CustomDataTable from '../../../components/DataTable'
import FormMasterPelanggaran from './components/FormMasterPelanggaran'

export default function MasterPelanggaranPage() {
  const toastRef = useRef(null)
  const [pelanggaranList, setPelanggaranList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dialogMode, setDialogMode] = useState(null) // 'add' atau 'edit'
  const [searchKeyword, setSearchKeyword] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  useEffect(() => {
    if (!token) {
      window.location.href = '/'
    } else {
      fetchPelanggaran()
    }
  }, [token])

  const fetchPelanggaran = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/master-pelanggaran`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setPelanggaranList(json.data || [])
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    if (!keyword) {
      fetchPelanggaran()
    } else {
      const lowerKeyword = keyword.toLowerCase()
      const filtered = pelanggaranList.filter(
        (p) =>
          p.KODE_PELANGGARAN?.toLowerCase().includes(lowerKeyword) ||
          p.NAMA_PELANGGARAN?.toLowerCase().includes(lowerKeyword) ||
          p.KATEGORI?.toLowerCase().includes(lowerKeyword)
      )
      setPelanggaranList(filtered)
    }
  }

  const handleSave = async (data) => {
    setLoading(true)
    try {
      const isAdd = dialogMode === 'add'
      const url = isAdd 
        ? `${API_URL}/master-pelanggaran` 
        : `${API_URL}/master-pelanggaran/${selectedItem.id}`
      
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
        fetchPelanggaran()
        setDialogMode(null)
        setSelectedItem(null)
      } else {
        // Ini akan menangkap error 400 dan menampilkan pesan dari backend
        console.error("Server Error:", responseData)
        toastRef.current?.showToast('01', responseData.message || 'Gagal menyimpan (Error 400)')
      }
    } catch (err) {
      console.error(err)
      toastRef.current?.showToast('01', 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (row) => {
    confirmDialog({
      message: `Hapus "${row.NAMA_PELANGGARAN}"?`,
      header: 'Konfirmasi',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true)
        try {
          const res = await fetch(`${API_URL}/master-pelanggaran/${row.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            toastRef.current?.showToast('00', 'Berhasil dihapus')
            fetchPelanggaran()
          }
        } catch (err) {
          toastRef.current?.showToast('01', 'Gagal menghapus')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const columns = [
    { field: 'KODE_PELANGGARAN', header: 'Kode', style: { width: '100px' } },
    { field: 'NAMA_PELANGGARAN', header: 'Jenis Pelanggaran', style: { minWidth: '200px' } },
    { field: 'KATEGORI', header: 'Kategori', style: { width: '150px' } },
    { field: 'BOBOT_POIN', header: 'Poin', style: { width: '80px', textAlign: 'center' } },
    { field: 'TINDAKAN_DEFAULT', header: 'Tindakan', style: { minWidth: '150px' } },
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

      <h3 className="text-xl font-semibold mb-4">Master Pelanggaran</h3>

      <div className="flex justify-content-end mb-3 gap-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={searchKeyword} onChange={(e) => handleSearch(e.target.value)} placeholder="Cari..." />
        </span>
        <Button label="Tambah" icon="pi pi-plus" severity="info" 
          onClick={() => { setDialogMode('add'); setSelectedItem(null); }} />
      </div>

      <CustomDataTable data={pelanggaranList} loading={loading} columns={columns} />

      <FormMasterPelanggaran
        visible={dialogMode !== null}
        onHide={() => { setDialogMode(null); setSelectedItem(null); }}
        selectedPelanggaran={selectedItem}
        onSave={handleSave}
      />
    </div>
  )
}