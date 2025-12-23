'use client'

import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import ToastNotifier from '../../../components/ToastNotifier'

export default function StatusPenilaianPage() {
    const toastRef = useRef(null)
    
    // States
    const [kelasOptions, setKelasOptions] = useState([])
    const [selectedKelas, setSelectedKelas] = useState(null)
    const [statusData, setStatusData] = useState([])
    const [loading, setLoading] = useState(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

    // 1. Ambil daftar kelas untuk Dropdown
    useEffect(() => {
        const fetchKelas = async () => {
            try {
                const res = await fetch(`${API_URL}/master-kelas`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const json = await res.json()
                if (res.ok && json.data) {
                    const options = json.data.map(k => ({ 
                        label: k.KELAS_ID, 
                        value: k.KELAS_ID 
                    }))
                    setKelasOptions(options)
                }
            } catch (err) {
                toastRef.current?.showToast('01', 'Gagal memuat daftar kelas')
            }
        }
        fetchKelas()
    }, [API_URL, token])

    // 2. Fetch data status penilaian saat Kelas dipilih
    useEffect(() => {
        if (selectedKelas) {
            fetchStatusPenilaian(selectedKelas)
        } else {
            setStatusData([])
        }
    }, [selectedKelas])

    const fetchStatusPenilaian = async (kelasId) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/penilaian/cek-status?kelas_id=${kelasId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const json = await res.json()
            if (res.ok) {
                setStatusData(json.data)
            }
        } catch (err) {
            toastRef.current?.showToast('01', 'Gagal mengambil status penilaian')
        } finally {
            setLoading(false)
        }
    }

    // Template untuk menampilkan status "X / Y Data" dengan warna dinamis
    const statusBodyTemplate = (rowData, field) => {
        const value = rowData[field]
        const parts = value.split(' / ')
        const terisi = parseInt(parts[0])
        const totalSiswa = parseInt(parts[1]?.split(' ')[0])
        
        // Kondisi: Jika sudah terisi semua dan total siswa > 0
        const isComplete = totalSiswa > 0 && terisi >= totalSiswa

        return (
            <Tag 
                value={value} 
                severity={isComplete ? 'success' : 'secondary'} 
                className="w-full py-2"
                style={!isComplete ? { backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' } : {}}
            />
        )
    }

    return (
        <div className="p-4">
            <ToastNotifier ref={toastRef} />
            
            <div className="flex align-items-center justify-content-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800 m-0">STATUS PENILAIAN</h1>
            </div>

            <Card className="mb-4 shadow-2 border-none">
                <div className="flex flex-column md:flex-row align-items-center gap-4">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-filter text-primary text-xl"></i>
                        <label className="font-bold text-lg">Filter Kelas :</label>
                    </div>
                    <Dropdown 
                        value={selectedKelas} 
                        options={kelasOptions} 
                        onChange={(e) => setSelectedKelas(e.value)} 
                        placeholder="Pilih Rombongan Belajar"
                        className="w-full md:w-25rem"
                        filter 
                        showClear
                    />
                </div>
            </Card>

            <DataTable 
                value={statusData} 
                loading={loading} 
                stripedRows 
                showGridlines
                responsiveLayout="scroll"
                emptyMessage={selectedKelas ? "Tidak ada data mata pelajaran aktif." : "Silakan pilih kelas terlebih dahulu."}
                className="shadow-3 border-round overflow-hidden"
            >
                <Column 
                    header="No" 
                    body={(data, options) => options.rowIndex + 1} 
                    style={{ width: '60px', textAlign: 'center' }} 
                    headerClassName="bg-primary text-white"
                />
                <Column 
                    header="Nama Mata Pelajaran" 
                    field="NAMA_MAPEL" 
                    headerClassName="bg-primary text-white"
                />
                <Column 
                    header="Rombel" 
                    field="Rombel" 
                    style={{ width: '150px', textAlign: 'center' }} 
                    headerClassName="bg-primary text-white"
                />
                <Column 
                    header="Nilai Rapor (P)" 
                    body={(r) => statusBodyTemplate(r, 'STATUS_P')} 
                    style={{ width: '200px' }} 
                    headerClassName="bg-primary text-white text-center"
                />
                <Column 
                    header="Deskripsi (K)" 
                    body={(r) => statusBodyTemplate(r, 'STATUS_K')} 
                    style={{ width: '200px' }} 
                    headerClassName="bg-primary text-white text-center"
                />
            </DataTable>

            <div className="mt-4 flex gap-3">
                <div className="flex align-items-center gap-2">
                    <div className="w-1rem h-1rem border-round bg-green-500"></div>
                    <span className="text-sm font-medium">Selesai (Semua siswa sudah dinilai)</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div className="w-1rem h-1rem border-round bg-gray-300"></div>
                    <span className="text-sm font-medium">Proses / Belum Lengkap</span>
                </div>
            </div>
        </div>
    )
}