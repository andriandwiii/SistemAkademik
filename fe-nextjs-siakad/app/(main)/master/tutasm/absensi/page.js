"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import ToastNotifier from "../../../../components/ToastNotifier";
import HeaderBar from "../../../../components/headerbar";
import CustomDataTable from "../../../../components/DataTable";
import FormAbsen from "./components/FormAbsen";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AbsensiSiswaPage() {
    const toastRef = useRef(null);
    const isMounted = useRef(true);

    const [token, setToken] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [absensiData, setAbsensiData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [tanggalFilter, setTanggalFilter] = useState(new Date());
    const [kelasFilter, setKelasFilter] = useState(null);
    const [kelasOptions, setKelasOptions] = useState([]);
    
    const [absenDialogVisible, setAbsenDialogVisible] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchMonitoringAbsensi = useCallback(async (t, tanggal, kelasId) => {
        if (!t || !tanggal) return;
        setIsLoading(true);
        try {
            const offset = tanggal.getTimezoneOffset();
            const adjustedDate = new Date(tanggal.getTime() - (offset * 60 * 1000));
            const tglStr = adjustedDate.toISOString().split('T')[0];

            const params = new URLSearchParams();
            params.append("tanggal", tglStr);
            if (kelasId) params.append("kelasId", kelasId);

            const res = await axios.get(`${API_URL}/tu-absensi/monitoring?${params.toString()}`, {
                headers: { Authorization: `Bearer ${t}` },
            });

            if (isMounted.current) {
                const data = res.data.data || [];
                setAbsensiData(data);
                setOriginalData(data);
            }
        } catch (err) {
            console.error("Fetch monitoring error", err);
            setAbsensiData([]);
            setOriginalData([]);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, []);

    const fetchMasterKelas = async (t) => {
        try {
            const res = await axios.get(`${API_URL}/master-kelas`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (res.data?.data) {
                setKelasOptions(res.data.data.map(k => ({ label: k.KELAS_ID, value: k.KELAS_ID })));
            }
        } catch (err) {
            console.error("Gagal load kelas", err);
        }
    };

    useEffect(() => {
        const t = localStorage.getItem("token");
        const profile = JSON.parse(localStorage.getItem("user") || "{}");

        if (!t) {
            window.location.href = "/";
        } else {
            setToken(t);
            setUserProfile(profile);
            fetchMasterKelas(t);
            fetchMonitoringAbsensi(t, tanggalFilter, kelasFilter);
        }
        return () => { isMounted.current = false; };
    }, [fetchMonitoringAbsensi]);

    useEffect(() => {
        if (token) fetchMonitoringAbsensi(token, tanggalFilter, kelasFilter);
    }, [tanggalFilter, kelasFilter, token, fetchMonitoringAbsensi]);

    const handleSearch = (keyword) => {
        if (!keyword) {
            setAbsensiData(originalData);
        } else {
            const lowerKeyword = keyword.toLowerCase();
            const filtered = originalData.filter(item => 
                (item.siswa?.NAMA || item.NAMA || "").toLowerCase().includes(lowerKeyword) ||
                (item.NIS || "").includes(lowerKeyword) ||
                (item.KELAS_ID || "").toLowerCase().includes(lowerKeyword)
            );
            setAbsensiData(filtered);
        }
    };

    const resetFilter = () => {
        setTanggalFilter(new Date());
        setKelasFilter(null);
    };

    const confirmDelete = (data) => {
        confirmDialog({
            message: `Apakah Anda yakin ingin menghapus data absensi ${data.siswa?.NAMA || 'ini'}?`,
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Ya",
            rejectLabel: "Batal",
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await axios.delete(`${API_URL}/tu-absensi/monitoring/${data.ABSENSI_ID}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toastRef.current?.showToast("00", "Data berhasil dihapus");
                    fetchMonitoringAbsensi(token, tanggalFilter, kelasFilter);
                } catch (err) {
                    toastRef.current?.showToast("01", "Gagal menghapus data");
                }
            },
        });
    };

    /**
     * PENGATURAN KOLOM TABEL
     * Menggunakan persentase (%) agar ukuran tetap proporsional
     */
    const columns = [
        { 
            header: "Tanggal", 
            body: (row) => row.TANGGAL ? new Date(row.TANGGAL).toLocaleDateString('id-ID') : "-",
            style: { width: '12%' }
        },
        { 
            header: "NIS", 
            body: (row) => <span className="font-medium">{row.NIS}</span>,
            style: { width: '10%' }
        },
        { 
            header: "Nama Siswa", 
            body: (row) => <span className="font-semibold">{row.siswa?.NAMA || row.NAMA}</span>,
            style: { width: '25%' }
        },
        { 
            header: "Kelas", 
            body: (row) => <span className="font-bold text-primary">{row.KELAS_ID}</span>,
            style: { width: '8%' }
        },
        { 
            header: "Status Absen", 
            body: (row) => {
                const severityMap = { HADIR: "success", ALPA: "danger", IZIN: "info", SAKIT: "warning", BOLOS: "danger" };
                return <Tag value={row.STATUS} severity={severityMap[row.STATUS] || "secondary"} />;
            }, 
            style: { width: '12%' } 
        },
        { 
            header: "Status BK", 
            body: (row) => {
                const sudahDitangani = row.BK?.SUDAH_DITANGGANI === 1 || row.SUDAH_DITANGGANI === 1;
                const perluTindakan = row.BK?.PERLU_TINDAKAN === 1 || row.PERLU_TINDAKAN === 1;
                if (sudahDitangani) return <Tag icon="pi pi-check" severity="success" value="Selesai" />;
                if (perluTindakan) return <Tag icon="pi pi-exclamation-circle" severity="danger" value="Pending" />;
                return <small className="text-400 italic">N/A</small>;
            }, 
            style: { width: '15%' } 
        },
        { 
            header: "Aksi", 
            body: (row) => (
                <div className="flex gap-2">
                    <Button icon="pi pi-pencil" severity="warning" rounded text onClick={() => { setEditData(row); setAbsenDialogVisible(true); }} />
                    <Button icon="pi pi-trash" severity="danger" rounded text onClick={() => confirmDelete(row)} />
                </div>
            ), 
            style: { width: '10%', textAlign: 'center' } 
        }
    ];

    return (
        <div className="card border-none shadow-none p-0">
            <ToastNotifier ref={toastRef} />
            <ConfirmDialog />

            <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>Monitoring Absensi Siswa</h3>

            <div className="flex flex-wrap align-items-end justify-content-between gap-3 mb-4 bg-gray-50 p-3 border-round border-1 border-200">
                <div className="flex flex-wrap align-items-end gap-3">
                    <div className="flex flex-column gap-2">
                        <label className="text-xs font-bold text-600 uppercase">Filter Tanggal</label>
                        <Calendar 
                            value={tanggalFilter} 
                            onChange={(e) => setTanggalFilter(e.value)} 
                            dateFormat="yy-mm-dd" 
                            showIcon 
                            className="w-11rem"
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label className="text-xs font-bold text-600 uppercase">Filter Kelas</label>
                        <Dropdown 
                            value={kelasFilter} 
                            options={kelasOptions} 
                            onChange={(e) => setKelasFilter(e.value)} 
                            placeholder="Semua Kelas" 
                            showClear 
                            className="w-11rem"
                        />
                    </div>

                    <Button 
                        icon="pi pi-refresh" 
                        className="p-button-outlined p-button-secondary" 
                        onClick={resetFilter}
                        loading={isLoading}
                        style={{ height: '42px' }}
                    />
                </div>

                <div className="flex align-items-center gap-2">
                    <HeaderBar 
                        title="" 
                        placeholder="Cari Nama / NIS..."
                        onSearch={handleSearch}
                        onAddClick={() => { setEditData(null); setAbsenDialogVisible(true); }} 
                        addButtonLabel="Absen Masal" 
                    />
                </div>
            </div>

            <CustomDataTable 
                data={absensiData} 
                loading={isLoading} 
                columns={columns} 
                paginator 
                rows={10}
                stripedRows
                responsiveLayout="scroll"
                className="mt-2 text-sm"
            />

            {absenDialogVisible && (
                <FormAbsen
                    visible={absenDialogVisible}
                    onHide={() => { setAbsenDialogVisible(false); setEditData(null); }}
                    token={token}
                    userProfile={userProfile}
                    editData={editData}
                    onSaveSuccess={() => {
                        setAbsenDialogVisible(false);
                        setEditData(null);
                        fetchMonitoringAbsensi(token, tanggalFilter, kelasFilter);
                        toastRef.current?.showToast("00", "Data berhasil diperbarui");
                    }}
                />
            )}
        </div>
    );
}