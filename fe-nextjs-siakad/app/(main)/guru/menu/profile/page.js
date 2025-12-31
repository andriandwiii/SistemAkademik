'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import ToastNotifier from '../../../../components/ToastNotifier';

const ProfileGuru = () => {
    const toastRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [guruData, setGuruData] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const token = getToken();
            
            if (!token) {
                toastRef.current?.showToast('01', 'Sesi login tidak ditemukan. Silakan login kembali.');
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/auth/login';
                    }
                }, 2000);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const baseURL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${baseURL}/auth/profile`, { headers });
            const data = await response.json();
            
            if (data.status !== "00") {
                throw new Error(data.message || 'Gagal mengambil profil');
            }

            setUserProfile(data.user);
            setGuruData(data.user.guru);
            toastRef.current?.showToast('00', 'Data profil berhasil dimuat');

        } catch (error) {
            console.error('Error fetching profile:', error);
            toastRef.current?.showToast('01', `Gagal memuat profil: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Aktif': 'success',
            'Cuti': 'warning',
            'Pensiun': 'danger'
        };
        return colors[status] || 'secondary';
    };

    const InfoRow = ({ label, value, icon }) => (
        <div className="flex align-items-start mb-3">
            <div className="flex align-items-center justify-content-center bg-blue-50 border-round" style={{ width: '2.5rem', height: '2.5rem', minWidth: '2.5rem' }}>
                <i className={`${icon} text-blue-500`} style={{ fontSize: '1.2rem' }}></i>
            </div>
            <div className="ml-3 flex-1">
                <div className="text-500 text-sm mb-1">{label}</div>
                <div className="text-900 font-medium">{value || '-'}</div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid">
                <ToastNotifier ref={toastRef} />
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center mb-4">
                            <Skeleton shape="circle" size="8rem" className="mr-3" />
                            <div className="flex-1">
                                <Skeleton width="60%" height="2rem" className="mb-2" />
                                <Skeleton width="40%" height="1.5rem" />
                            </div>
                        </div>
                        <Skeleton height="400px" />
                    </Card>
                </div>
            </div>
        );
    }

    const transaksiWaliKelas = guruData?.transaksi_guru_wakel?.[0];
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const fotoUrl = guruData?.FOTO
        ? guruData.FOTO.startsWith('http')
            ? guruData.FOTO
            : `${API_URL.replace('/api', '')}${guruData.FOTO}`
        : null;

    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Header Profile Card */}
            <div className="col-12">
                <Card>
                    <div className="flex flex-column lg:flex-row align-items-center gap-4">
                        {/* Avatar */}
                        <div className="flex flex-column align-items-center">
                            {fotoUrl ? (
                                <img 
                                    src={fotoUrl} 
                                    alt="Foto Profil"
                                    className="border-circle shadow-2"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <Avatar 
                                icon="pi pi-user" 
                                size="xlarge" 
                                shape="circle"
                                className="shadow-2"
                                style={{ 
                                    width: '150px', 
                                    height: '150px', 
                                    fontSize: '4rem',
                                    display: fotoUrl ? 'none' : 'flex'
                                }}
                            />
                            <Badge 
                                value={guruData?.STATUS_KEPEGAWAIAN || 'Aktif'} 
                                severity={getStatusColor(guruData?.STATUS_KEPEGAWAIAN)}
                                className="mt-2"
                            />
                        </div>

                        {/* Info Utama */}
                        <div className="flex-1">
                            <h2 className="mt-0 mb-2 text-900">{guruData?.NAMA || '-'}</h2>
                            <div className="flex flex-wrap gap-3 mb-3">
                                <div className="flex align-items-center">
                                    <i className="pi pi-id-card mr-2 text-blue-500"></i>
                                    <span className="text-600">NIP: <strong>{guruData?.NIP || '-'}</strong></span>
                                </div>
                                <div className="flex align-items-center">
                                    <i className="pi pi-briefcase mr-2 text-blue-500"></i>
                                    <span className="text-600">Jabatan: <strong>{guruData?.JABATAN || '-'}</strong></span>
                                </div>
                                <div className="flex align-items-center">
                                    <i className="pi pi-at mr-2 text-blue-500"></i>
                                    <span className="text-600">{userProfile?.email || '-'}</span>
                                </div>
                            </div>

                            {guruData?.PANGKAT && (
                                <div className="mb-3">
                                    <Badge value={guruData.PANGKAT} severity="info" className="text-base" />
                                </div>
                            )}

                            {/* Info Wali Kelas */}
                            {transaksiWaliKelas && (
                                <div className="surface-100 border-round p-3">
                                    <div className="flex align-items-center mb-2">
                                        <i className="pi pi-users mr-2 text-blue-600"></i>
                                        <span className="font-semibold text-blue-600">Wali Kelas</span>
                                    </div>
                                    <div className="grid">
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Tingkatan</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiWaliKelas.tingkatan?.TINGKATAN || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Jurusan</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiWaliKelas.jurusan?.NAMA_JURUSAN || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Ruang Kelas</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiWaliKelas.kelas?.NAMA_RUANG || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Kode Kelas</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiWaliKelas.kelas?.KELAS_ID || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detail Information Tabs */}
            <div className="col-12">
                <Card>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        {/* Tab Data Pribadi */}
                        <TabPanel header="Data Pribadi" leftIcon="pi pi-user mr-2">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-user"
                                        label="Nama Lengkap"
                                        value={guruData?.NAMA}
                                    />
                                    <InfoRow 
                                        icon="pi pi-id-card"
                                        label="NIP"
                                        value={guruData?.NIP}
                                    />
                                    <InfoRow 
                                        icon="pi pi-venus-mars"
                                        label="Jenis Kelamin"
                                        value={guruData?.GENDER === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    />
                                    <InfoRow 
                                        icon="pi pi-map-marker"
                                        label="Tempat Lahir"
                                        value={guruData?.TEMPAT_LAHIR}
                                    />
                                    <InfoRow 
                                        icon="pi pi-calendar"
                                        label="Tanggal Lahir"
                                        value={formatDate(guruData?.TGL_LAHIR)}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-home"
                                        label="Alamat"
                                        value={guruData?.ALAMAT}
                                    />
                                    <InfoRow 
                                        icon="pi pi-phone"
                                        label="No. Telepon"
                                        value={guruData?.NO_TELP}
                                    />
                                    <InfoRow 
                                        icon="pi pi-at"
                                        label="Email"
                                        value={guruData?.EMAIL}
                                    />
                                    <InfoRow 
                                        icon="pi pi-briefcase"
                                        label="Status Kepegawaian"
                                        value={guruData?.STATUS_KEPEGAWAIAN}
                                    />
                                    <InfoRow 
                                        icon="pi pi-star"
                                        label="Pangkat"
                                        value={guruData?.PANGKAT}
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        {/* Tab Data Kepegawaian */}
                        <TabPanel header="Data Kepegawaian" leftIcon="pi pi-briefcase mr-2">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-bookmark"
                                        label="Kode Jabatan"
                                        value={guruData?.KODE_JABATAN}
                                    />
                                    <InfoRow 
                                        icon="pi pi-briefcase"
                                        label="Nama Jabatan"
                                        value={guruData?.JABATAN}
                                    />
                                    <InfoRow 
                                        icon="pi pi-star"
                                        label="Pangkat"
                                        value={guruData?.PANGKAT}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-check-circle"
                                        label="Status Kepegawaian"
                                        value={guruData?.STATUS_KEPEGAWAIAN}
                                    />
                                    <InfoRow 
                                        icon="pi pi-book"
                                        label="Keahlian"
                                        value={guruData?.KEAHLIAN}
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        {/* Tab Pendidikan & Sertifikasi */}
                        <TabPanel header="Pendidikan & Sertifikasi" leftIcon="pi pi-graduation-cap mr-2">
                            <div className="grid">
                                {/* Pendidikan Terakhir */}
                                <div className="col-12">
                                    <h5 className="text-blue-600 mb-3">
                                        <i className="pi pi-graduation-cap mr-2"></i>Pendidikan Terakhir
                                    </h5>
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-book"
                                        label="Jenjang Pendidikan"
                                        value={guruData?.PENDIDIKAN_TERAKHIR}
                                    />
                                    <InfoRow 
                                        icon="pi pi-building"
                                        label="Universitas"
                                        value={guruData?.UNIVERSITAS}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-calendar"
                                        label="Tahun Lulus"
                                        value={guruData?.TAHUN_LULUS}
                                    />
                                </div>

                                <div className="col-12"><Divider /></div>

                                {/* Sertifikasi Pendidik */}
                                <div className="col-12">
                                    <h5 className="text-green-600 mb-3">
                                        <i className="pi pi-verified mr-2"></i>Sertifikasi Pendidik
                                    </h5>
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-file"
                                        label="No. Sertifikat Pendidik"
                                        value={guruData?.NO_SERTIFIKAT_PENDIDIK}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-calendar"
                                        label="Tahun Sertifikat"
                                        value={guruData?.TAHUN_SERTIFIKAT}
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        {/* Tab Riwayat Wali Kelas */}
                        <TabPanel header="Riwayat Wali Kelas" leftIcon="pi pi-history mr-2">
                            {guruData?.transaksi_guru_wakel && guruData.transaksi_guru_wakel.length > 0 ? (
                                <div className="grid">
                                    {guruData.transaksi_guru_wakel.map((trx, index) => (
                                        <div key={index} className="col-12 md:col-6 lg:col-4">
                                            <Card className="shadow-2">
                                                <div className="text-center mb-3">
                                                    <Badge 
                                                        value={trx.TRANSAKSI_ID || '-'} 
                                                        severity="info"
                                                        className="text-base"
                                                    />
                                                </div>
                                                <div className="flex flex-column gap-2">
                                                    <div className="flex align-items-center">
                                                        <i className="pi pi-book mr-2 text-blue-500"></i>
                                                        <span className="text-600">Tingkatan:</span>
                                                        <strong className="ml-2">{trx.tingkatan?.TINGKATAN || '-'}</strong>
                                                    </div>
                                                    <div className="flex align-items-center">
                                                        <i className="pi pi-graduation-cap mr-2 text-blue-500"></i>
                                                        <span className="text-600">Jurusan:</span>
                                                        <strong className="ml-2">{trx.jurusan?.NAMA_JURUSAN || '-'}</strong>
                                                    </div>
                                                    <div className="flex align-items-center">
                                                        <i className="pi pi-building mr-2 text-blue-500"></i>
                                                        <span className="text-600">Ruang:</span>
                                                        <strong className="ml-2">{trx.kelas?.NAMA_RUANG || '-'}</strong>
                                                    </div>
                                                    <div className="flex align-items-center">
                                                        <i className="pi pi-tag mr-2 text-blue-500"></i>
                                                        <span className="text-600">Kelas ID:</span>
                                                        <strong className="ml-2">{trx.kelas?.KELAS_ID || '-'}</strong>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="pi pi-info-circle" style={{ fontSize: '3rem', color: 'var(--text-color-secondary)' }}></i>
                                    <p className="text-600 mt-3">Belum ada riwayat sebagai wali kelas</p>
                                </div>
                            )}
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
        </div>
    );
};

export default ProfileGuru;