/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Message } from 'primereact/message';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryKehadiranWakelPage() {
    const toast = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Data Guru & Perwalian
    const [wakelData, setWakelData] = useState(null);
    const [students, setStudents] = useState([]);
    const [opsiTahun, setOpsiTahun] = useState([]);
    
    // Filter (Tahun Ajaran tetap bisa dipilih, tapi Kelas dikunci ke perwalian)
    const [selectedTahun, setSelectedTahun] = useState("");

    // Helper API dengan Token
    const apiCall = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    };

    useEffect(() => {
        initPage();
    }, []);

    const initPage = async () => {
        try {
            setLoading(true);
            
            // 1. Ambil Profile & Data Tahun Ajaran secara paralel
            const [profileRes, tahunRes] = await Promise.all([
                apiCall(`${API_URL}/auth/profile`),
                apiCall(`${API_URL}/master-tahun-ajaran`)
            ]);

            const nipGuru = profileRes.user?.guru?.NIP;
            if (!nipGuru) throw new Error("Data NIP Guru tidak ditemukan");

            // 2. Cari data perwalian guru ini
            const wakelRes = await apiCall(`${API_URL}/transaksi-wakel`);
            const myPerwalian = wakelRes.data?.find(t => t.guru.NIP === nipGuru);

            if (!myPerwalian) {
                setWakelData(null);
            } else {
                setWakelData(myPerwalian);
            }

            // 3. Set Opsi Tahun Ajaran
            setOpsiTahun((tahunRes.data || []).map(i => ({
                label: i.NAMA_TAHUN_AJARAN,
                value: i.TAHUN_AJARAN_ID
            })));

        } catch (e) {
            toast.current?.show({ severity: "error", summary: "Error", detail: e.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchKehadiranSiswa = async () => {
        if (!selectedTahun || !wakelData) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                kelas_id: wakelData.kelas.KELAS_ID,
                tahun_ajaran_id: selectedTahun,
                tingkatan_id: wakelData.tingkatan.TINGKATAN_ID,
                jurusan_id: wakelData.jurusan.JURUSAN_ID
            });

            const res = await apiCall(`${API_URL}/kehadiran/cek-kehadiran?${params.toString()}`);
            const dataSiswa = (res.data || res || []).map(s => ({
                ...s,
                SAKIT: s.SAKIT ?? 0,
                IZIN: s.IZIN ?? 0,
                ALPA: s.ALPA ?? 0,
            }));

            setStudents(dataSiswa);
        } catch (e) {
            toast.current?.show({ severity: "error", summary: "Error", detail: "Gagal memuat data siswa" });
        } finally {
            setLoading(false);
        }
    };

    const saveAll = async () => {
        setIsSaving(true);
        try {
            await apiCall(`${API_URL}/kehadiran/simpan-kehadiran`, {
                method: 'POST',
                body: JSON.stringify({
                    tahun_ajaran_id: selectedTahun,
                    kelas_id: wakelData.kelas.KELAS_ID,
                    tingkatan_id: wakelData.tingkatan.TINGKATAN_ID,
                    jurusan_id: wakelData.jurusan.JURUSAN_ID,
                    data_kehadiran: students
                })
            });
            toast.current?.show({ severity: "success", summary: "Berhasil", detail: "Kehadiran berhasil disimpan" });
        } catch (e) {
            toast.current?.show({ severity: "error", summary: "Gagal", detail: "Gagal menyimpan data" });
        } finally {
            setIsSaving(false);
        }
    };

    const inputTemplate = (row, field) => (
        <input
            type="number"
            value={row[field] ?? 0}
            onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val < 0) return;
                setStudents(prev => prev.map(s => s.NIS === row.NIS ? { ...s, [field]: val } : s));
            }}
            className="p-inputtext p-component w-full text-center"
            min="0"
        />
    );

    if (loading && !students.length) {
        return <div className="text-center p-8"><ProgressSpinner /></div>;
    }

    if (!wakelData && !loading) {
        return (
            <div className="p-4">
                <Message severity="warn" text="Anda tidak terdaftar sebagai Wali Kelas di kelas manapun." className="w-full" />
            </div>
        );
    }

    return (
        <div className="grid justify-content-center">
            <Toast ref={toast} />

            <div className="col-12 md:col-11">
                <Card className="mb-4 shadow-1 border-top-3 border-primary">
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h5 className="font-bold text-900 m-0">Entry Kehadiran Siswa (Wali Kelas)</h5>
                            <p className="text-sm text-500">
                                Kelas: <strong>{wakelData?.tingkatan?.TINGKATAN} {wakelData?.jurusan?.NAMA_JURUSAN} - {wakelData?.kelas?.NAMA_RUANG}</strong>
                            </p>
                        </div>
                        <i className="pi pi-verified text-primary text-3xl opacity-50"></i>
                    </div>
                    
                    <Divider />

                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">Pilih Tahun Ajaran</label>
                            <Dropdown 
                                value={selectedTahun} 
                                options={opsiTahun} 
                                onChange={(e) => setSelectedTahun(e.value)} 
                                placeholder="Pilih Tahun Ajaran" 
                            />
                        </div>
                        <div className="field col-12 md:col-2 flex align-items-end">
                            <Button 
                                label="Tampilkan" 
                                icon="pi pi-search" 
                                onClick={fetchKehadiranSiswa} 
                                disabled={!selectedTahun || loading} 
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {students.length > 0 && (
                <div className="col-12 md:col-11">
                    <Card className="shadow-1">
                        <div className="flex justify-content-between align-items-center mb-3">
                           <h5 className="font-bold m-0 text-700">Daftar Siswa Kelas {wakelData?.kelas?.NAMA_RUANG}</h5>
                           <Button 
                                label="Simpan Rekap Kehadiran" 
                                icon="pi pi-save" 
                                severity="success" 
                                onClick={saveAll} 
                                loading={isSaving} 
                            />
                        </div>
                        
                        <DataTable value={students} showGridlines stripedRows paginator rows={10} responsiveLayout="scroll">
                            <Column header="No." body={(r, o) => o.rowIndex + 1} style={{ width: "50px" }} />
                            <Column field="NIS" header="NIS" style={{ width: "120px" }} />
                            <Column field="NAMA" header="Nama Siswa" />
                            <Column header="Sakit" body={(r) => inputTemplate(r, "SAKIT")} style={{ width: "100px" }} />
                            <Column header="Izin" body={(r) => inputTemplate(r, "IZIN")} style={{ width: "100px" }} />
                            <Column header="Alpa" body={(r) => inputTemplate(r, "ALPA")} style={{ width: "100px" }} />
                        </DataTable>
                    </Card>
                </div>
            )}
        </div>
    );
}