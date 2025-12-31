"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";

// IMPORT KOMPONEN PRINTER
// Sesuaikan path dengan struktur folder Anda
import AdjustPrintBukuInduk from "./print/AdjustPrintBukuInduk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RaportSiswaPage() {
    const toast = useRef(null);

    // =============================== STATE =====================================
    const [profileSiswa, setProfileSiswa] = useState(null);
    const [tahunAjaranList, setTahunAjaranList] = useState([]);
    const [selectedTahun, setSelectedTahun] = useState("");
    const [semesterList, setSemesterList] = useState([
        { label: 'Semester 1', value: '1' },
        { label: 'Semester 2', value: '2' }
    ]);
    const [selectedSemester, setSelectedSemester] = useState("1");
    const [kelasInfo, setKelasInfo] = useState(null);
    
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingKelas, setLoadingKelas] = useState(false);
    const [loadingRaport, setLoadingRaport] = useState(false);
    
    const [raportData, setRaportData] = useState(null);
    const [showPrintDialog, setShowPrintDialog] = useState(false);

    // =============================== LOAD PROFILE ===============================
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoadingProfile(true);

            const response = await fetch(`${API_URL}/buku-induk/siswa/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.status === "00") {
                setProfileSiswa(result.data.siswa);
                setTahunAjaranList(
                    result.data.tahun_ajaran_list.map(t => ({
                        label: t.NAMA_TAHUN_AJARAN,
                        value: t.TAHUN_AJARAN_ID
                    }))
                );

                // Set tahun ajaran aktif sebagai default
                if (result.data.tahun_ajaran_aktif) {
                    setSelectedTahun(result.data.tahun_ajaran_aktif.TAHUN_AJARAN_ID);
                }
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: result.message || 'Gagal memuat profile',
                    life: 3000
                });
            }

        } catch (error) {
            console.error("Error loading profile:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Tidak bisa menghubungi server',
                life: 3000
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    // =============================== LOAD KELAS INFO ============================
    useEffect(() => {
        if (selectedTahun) {
            loadKelasInfo();
        } else {
            setKelasInfo(null);
            setRaportData(null);
        }
    }, [selectedTahun]);

    const loadKelasInfo = async () => {
        try {
            setLoadingKelas(true);

            const response = await fetch(
                `${API_URL}/buku-induk/siswa/kelas?tahun_ajaran_id=${selectedTahun}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const result = await response.json();

            if (result.status === "00") {
                setKelasInfo(result.data.kelas_info);
            } else {
                setKelasInfo(null);
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Peringatan',
                    detail: result.message || 'Data kelas tidak ditemukan',
                    life: 3000
                });
            }

        } catch (error) {
            console.error("Error loading kelas:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal memuat data kelas',
                life: 3000
            });
        } finally {
            setLoadingKelas(false);
        }
    };

    // =============================== HANDLE LOAD RAPORT =========================
    const handleLoadRaport = async () => {
        if (!selectedTahun || !selectedSemester) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Pilih tahun ajaran dan semester terlebih dahulu',
                life: 3000
            });
            return;
        }

        setLoadingRaport(true);
        try {
            const url = `${API_URL}/buku-induk/siswa/raport?tahun_ajaran_id=${selectedTahun}&semester=${selectedSemester}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.status === "00") {
                setRaportData(result.data);
                setShowPrintDialog(true);
                
                toast.current?.show({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data raport berhasil dimuat',
                    life: 3000
                });
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: result.message || 'Data raport tidak ditemukan',
                    life: 3000
                });
                setRaportData(null);
            }

        } catch (error) {
            console.error("Error loading raport:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Tidak bisa menghubungi server',
                life: 3000
            });
        } finally {
            setLoadingRaport(false);
        }
    };

    // =============================== RENDER =====================================
    if (loadingProfile) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!profileSiswa) {
        return (
            <div className="flex justify-content-center p-4">
                <Card className="shadow-4 border-round-xl col-12 md:col-8">
                    <div className="text-center">
                        <i className="pi pi-info-circle text-6xl text-orange-500 mb-3"></i>
                        <h3 className="text-900 font-bold">Data Siswa Tidak Ditemukan</h3>
                        <p className="text-600">Silakan hubungi administrator untuk pengecekan data.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-content-center p-4">
            <Toast ref={toast} />

            <div className="col-12">
                {/* Profile Card */}
                <Card className="shadow-4 border-round-xl mb-4">
                    <div className="flex flex-column md:flex-row align-items-center gap-4">
                        {/* Avatar dengan handling foto */}
                        <div className="flex flex-column align-items-center">
                            {(() => {
                                const fotoUrl = profileSiswa.FOTO
                                    ? profileSiswa.FOTO.startsWith('http')
                                        ? profileSiswa.FOTO
                                        : `${API_URL.replace('/api', '')}${profileSiswa.FOTO}`
                                    : null;

                                return fotoUrl ? (
                                    <img 
                                        src={fotoUrl} 
                                        alt="Foto Siswa"
                                        className="border-circle shadow-4 border-3 border-primary"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null;
                            })()}
                            <Avatar 
                                icon="pi pi-user" 
                                size="xlarge" 
                                shape="circle"
                                className="shadow-4 border-3 border-primary"
                                style={{ 
                                    width: '120px', 
                                    height: '120px',
                                    fontSize: '3rem',
                                    display: profileSiswa.FOTO ? 'none' : 'flex'
                                }}
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="m-0 text-900 font-bold">{profileSiswa.NAMA}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 justify-content-center md:justify-content-start">
                                <Tag value={`NIS: ${profileSiswa.NIS}`} severity="success" />
                                <Tag value={`NISN: ${profileSiswa.NISN}`} severity="info" />
                                <Tag 
                                    value={profileSiswa.GENDER === 'L' ? 'Laki-laki' : 'Perempuan'} 
                                    severity={profileSiswa.GENDER === 'L' ? 'info' : 'danger'} 
                                />
                            </div>
                            <p className="text-600 mt-2 mb-0">
                                <i className="pi pi-calendar mr-2"></i>
                                Tanggal Lahir: {profileSiswa.TGL_LAHIR}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Filter & Kelas Info Card */}
                <Card className="shadow-4 border-round-xl mb-4">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-book text-primary text-4xl mr-3"></i>
                        <div>
                            <h3 className="m-0 text-900 font-bold">Raport Siswa</h3>
                            <small className="text-600">Pilih tahun ajaran dan semester untuk melihat raport</small>
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
                                    setRaportData(null);
                                }}
                                placeholder="Pilih Tahun Ajaran"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-bold">Semester</label>
                            <Dropdown
                                value={selectedSemester}
                                options={semesterList}
                                onChange={(e) => {
                                    setSelectedSemester(e.value);
                                    setRaportData(null);
                                }}
                                placeholder="Pilih Semester"
                            />
                        </div>

                        {kelasInfo && (
                            <div className="col-12">
                                <div className="bg-primary-50 p-3 border-round">
                                    <h4 className="mt-0 mb-2 text-primary">
                                        <i className="pi pi-home mr-2"></i>
                                        Informasi Kelas
                                    </h4>
                                    <div className="flex gap-3 flex-wrap">
                                        <Tag value={`Kelas ${kelasInfo.KELAS_ID}`} severity="success" />
                                        <Tag value={kelasInfo.NAMA_RUANG} severity="info" />
                                        <Tag value={kelasInfo.TINGKATAN} />
                                        {kelasInfo.NAMA_JURUSAN && (
                                            <Tag value={kelasInfo.NAMA_JURUSAN} severity="warning" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Preview Raport"
                            icon={loadingRaport ? "pi pi-spin pi-spinner" : "pi pi-eye"}
                            className="p-button-raised p-button-primary p-button-lg px-6"
                            onClick={handleLoadRaport}
                            disabled={loadingRaport || !selectedTahun || loadingKelas}
                        />
                    </div>
                </Card>

                {/* Info Card - Petunjuk */}
                <Card className="shadow-4 border-round-xl bg-blue-50">
                    <div className="flex align-items-start gap-3">
                        <i className="pi pi-info-circle text-blue-500 text-3xl"></i>
                        <div>
                            <h4 className="mt-0 mb-2 text-blue-900">Informasi</h4>
                            <ul className="m-0 pl-3 text-blue-800 line-height-3">
                                <li>Pilih tahun ajaran dan semester untuk melihat raport Anda</li>
                                <li>Klik tombol "Preview Raport" untuk menampilkan data raport</li>
                                <li>Anda dapat mencetak atau download raport dalam format PDF</li>
                                <li>Jika data tidak muncul, hubungi wali kelas atau admin sekolah</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>

            {/* KOMPONEN MODAL PREVIEW PRINT */}
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