"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

// IMPORT KOMPONEN PRINTER
// Sesuaikan path dengan struktur folder Anda
import AdjustPrintBukuInduk from "./print/AdjustPrintBukuInduk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CetakRaportWaliKelas() {
    const toast = useRef(null);

    // =============================== STATE =====================================
    const [kelasInfo, setKelasInfo] = useState(null);
    const [tahunAjaranList, setTahunAjaranList] = useState([]);
    const [selectedTahun, setSelectedTahun] = useState("");
    const [siswaList, setSiswaList] = useState([]);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingSiswa, setLoadingSiswa] = useState(false);
    const [loadingPrint, setLoadingPrint] = useState(false);
    const [raportData, setRaportData] = useState(null);
    const [showPrintDialog, setShowPrintDialog] = useState(false);

    // =============================== LOAD INITIAL DATA ==========================
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoadingInit(true);

            // Load info kelas wali + tahun ajaran
            const [kelasRes, tahunRes] = await Promise.all([
                fetch(`${API_URL}/buku-induk/wali-kelas/info`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(r => r.json()),
                fetch(`${API_URL}/master-tahun-ajaran`).then(r => r.json())
            ]);

            if (kelasRes.status === "00") {
                setKelasInfo(kelasRes.data.kelas_info);
                
                // Set tahun ajaran aktif sebagai default
                if (kelasRes.data.tahun_ajaran_aktif) {
                    setSelectedTahun(kelasRes.data.tahun_ajaran_aktif.TAHUN_AJARAN_ID);
                }
            } else {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Peringatan',
                    detail: kelasRes.message || 'Anda belum ditugaskan sebagai wali kelas',
                    life: 5000
                });
            }

            if (tahunRes.data) {
                setTahunAjaranList(
                    tahunRes.data.map(t => ({
                        label: t.NAMA_TAHUN_AJARAN,
                        value: t.TAHUN_AJARAN_ID
                    }))
                );
            }

        } catch (error) {
            console.error("Error loading initial data:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal memuat data awal',
                life: 3000
            });
        } finally {
            setLoadingInit(false);
        }
    };

    // =============================== LOAD SISWA =================================
    useEffect(() => {
        if (selectedTahun) {
            loadSiswa();
        } else {
            setSiswaList([]);
            setSelectedSiswa(null);
        }
    }, [selectedTahun]);

    const loadSiswa = async () => {
        try {
            setLoadingSiswa(true);
            
            const response = await fetch(
                `${API_URL}/buku-induk/wali-kelas/siswa?tahun_ajaran_id=${selectedTahun}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            const result = await response.json();

            if (result.status === "00") {
                setSiswaList(result.data.siswa || []);
            } else {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Peringatan',
                    detail: result.message || 'Tidak ada siswa di kelas Anda',
                    life: 3000
                });
                setSiswaList([]);
            }

        } catch (error) {
            console.error("Error loading siswa:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal memuat data siswa',
                life: 3000
            });
        } finally {
            setLoadingSiswa(false);
        }
    };

    // =============================== HANDLE PRINT ===============================
    const handleGenerateRaport = async () => {
        if (!selectedSiswa) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Pilih siswa terlebih dahulu',
                life: 3000
            });
            return;
        }

        setLoadingPrint(true);
        try {
            const url = `${API_URL}/buku-induk/wali-kelas/generate?nis=${selectedSiswa.NIS}&tahun_ajaran_id=${selectedTahun}&semester=1`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const resJson = await response.json();

            if (resJson.status === "00") {
                setRaportData(resJson.data);
                setShowPrintDialog(true);
                
                toast.current?.show({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data raport berhasil digenerate',
                    life: 3000
                });
                
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: resJson.message || 'Data raport tidak ditemukan',
                    life: 3000
                });
            }
        } catch (error) {
            console.error("Error generating raport:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Tidak bisa menghubungi server',
                life: 3000
            });
        } finally {
            setLoadingPrint(false);
        }
    };

    // =============================== RENDER =====================================

    const genderBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.GENDER}
                severity={rowData.GENDER === 'L' ? 'info' : 'danger'}
            />
        );
    };

    if (loadingInit) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!kelasInfo) {
        return (
            <div className="flex justify-content-center p-4">
                <Card className="shadow-4 border-round-xl col-12 md:col-8">
                    <div className="text-center">
                        <i className="pi pi-info-circle text-6xl text-orange-500 mb-3"></i>
                        <h3 className="text-900 font-bold">Anda Belum Ditugaskan Sebagai Wali Kelas</h3>
                        <p className="text-600">Silakan hubungi admin untuk penugasan wali kelas.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-content-center p-4">
            <Toast ref={toast} />

            <div className="col-12">
                {/* Info Kelas Card */}
                <Card className="shadow-4 border-round-xl mb-4">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center">
                            <i className="pi pi-users text-primary text-4xl mr-3"></i>
                            <div>
                                <h3 className="m-0 text-900 font-bold">Wali Kelas</h3>
                                <div className="flex gap-3 mt-2">
                                    <Tag value={`Kelas ${kelasInfo.KELAS_ID}`} severity="success" />
                                    <Tag value={kelasInfo.NAMA_RUANG} severity="info" />
                                    <Tag value={kelasInfo.TINGKATAN} />
                                    {kelasInfo.NAMA_JURUSAN && (
                                        <Tag value={kelasInfo.NAMA_JURUSAN} severity="warning" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Filter & Action Card */}
                <Card className="shadow-4 border-round-xl mb-4">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-print text-primary text-4xl mr-3"></i>
                        <div>
                            <h3 className="m-0 text-900 font-bold">Cetak Laporan Raport</h3>
                            <small className="text-600">Pilih tahun ajaran dan siswa untuk mencetak raport</small>
                        </div>
                    </div>

                    <Divider />

                    <div className="p-fluid grid">
                        <div className="field col-12 md:col-6">
                            <label className="font-bold">Tahun Ajaran</label>
                            <Dropdown
                                value={selectedTahun}
                                options={tahunAjaranList}
                                onChange={(e) => {
                                    setSelectedTahun(e.value);
                                    setSelectedSiswa(null);
                                }}
                                placeholder="Pilih Tahun Ajaran"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-bold">Jumlah Siswa</label>
                            <div className="p-3 bg-primary-50 border-round">
                                <span className="text-2xl font-bold text-primary">
                                    {siswaList.length} Siswa
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Daftar Siswa */}
                <Card className="shadow-4 border-round-xl">
                    <h4 className="text-900 font-bold mb-3">
                        <i className="pi pi-list mr-2"></i>
                        Daftar Siswa
                    </h4>
                    
                    <DataTable
                        value={siswaList}
                        loading={loadingSiswa}
                        selection={selectedSiswa}
                        onSelectionChange={(e) => setSelectedSiswa(e.value)}
                        selectionMode="single"
                        dataKey="NIS"
                        paginator
                        rows={10}
                        emptyMessage="Tidak ada data siswa"
                        className="border-round"
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
                        <Column field="NIS" header="NIS" sortable />
                        <Column field="NAMA" header="Nama Lengkap" sortable />
                        <Column field="GENDER" header="Gender" body={genderBodyTemplate} />
                        
                    </DataTable>

                    <Divider className="mt-4" />

                    <div className="flex justify-content-end">
                        <Button
                            label="Generate Preview Raport"
                            icon={loadingPrint ? "pi pi-spin pi-spinner" : "pi pi-file-pdf"}
                            className="p-button-raised p-button-primary p-button-lg px-6"
                            onClick={handleGenerateRaport}
                            disabled={loadingPrint || !selectedSiswa}
                        />
                    </div>
                </Card>
            </div>

            {/* KOMPONEN MODAL PREVIEW */}
            {raportData && (
                <AdjustPrintBukuInduk
                    visible={showPrintDialog}
                    onHide={() => {
                        setShowPrintDialog(false);
                        setRaportData(null);
                    }}
                    dataRaport={raportData}
                />
            )}
        </div>
    );
}