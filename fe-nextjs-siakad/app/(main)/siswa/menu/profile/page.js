'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import ToastNotifier from '../../../../components/ToastNotifier';

const ProfileSiswa = () => {
    const toastRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [siswaData, setSiswaData] = useState(null);
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
            setSiswaData(data.user.siswa);
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
            'Lulus': 'info',
            'Pindah': 'warning',
            'Nonaktif': 'danger'
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

    const transaksiKelas = siswaData?.transaksi_siswa_kelas?.[0];
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const fotoUrl = siswaData?.FOTO
        ? siswaData.FOTO.startsWith('http')
            ? siswaData.FOTO
            : `${API_URL.replace('/api', '')}${siswaData.FOTO}`
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
                                value={siswaData?.STATUS || 'Aktif'} 
                                severity={getStatusColor(siswaData?.STATUS)}
                                className="mt-2"
                            />
                        </div>

                        {/* Info Utama */}
                        <div className="flex-1">
                            <h2 className="mt-0 mb-2 text-900">{siswaData?.NAMA || '-'}</h2>
                            <div className="flex flex-wrap gap-3 mb-3">
                                <div className="flex align-items-center">
                                    <i className="pi pi-id-card mr-2 text-blue-500"></i>
                                    <span className="text-600">NIS: <strong>{siswaData?.NIS || '-'}</strong></span>
                                </div>
                                <div className="flex align-items-center">
                                    <i className="pi pi-bookmark mr-2 text-blue-500"></i>
                                    <span className="text-600">NISN: <strong>{siswaData?.NISN || '-'}</strong></span>
                                </div>
                                <div className="flex align-items-center">
                                    <i className="pi pi-at mr-2 text-blue-500"></i>
                                    <span className="text-600">{userProfile?.email || '-'}</span>
                                </div>
                            </div>

                            {/* Info Kelas */}
                            {transaksiKelas && (
                                <div className="surface-100 border-round p-3">
                                    <div className="grid">
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Tingkatan</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiKelas.tingkatan?.TINGKATAN || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Jurusan</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiKelas.jurusan?.NAMA_JURUSAN || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Ruang Kelas</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiKelas.kelas?.NAMA_RUANG || '-'}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="text-500 text-sm">Tahun Ajaran</div>
                                            <div className="text-900 font-bold text-lg">
                                                {transaksiKelas.tahun_ajaran?.NAMA_TAHUN_AJARAN || '-'}
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
                                        value={siswaData?.NAMA}
                                    />
                                    <InfoRow 
                                        icon="pi pi-venus-mars"
                                        label="Jenis Kelamin"
                                        value={siswaData?.GENDER === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    />
                                    <InfoRow 
                                        icon="pi pi-map-marker"
                                        label="Tempat Lahir"
                                        value={siswaData?.TEMPAT_LAHIR}
                                    />
                                    <InfoRow 
                                        icon="pi pi-calendar"
                                        label="Tanggal Lahir"
                                        value={formatDate(siswaData?.TGL_LAHIR)}
                                    />
                                    <InfoRow 
                                        icon="pi pi-heart"
                                        label="Agama"
                                        value={siswaData?.AGAMA}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-home"
                                        label="Alamat"
                                        value={siswaData?.ALAMAT}
                                    />
                                    <InfoRow 
                                        icon="pi pi-phone"
                                        label="No. Telepon"
                                        value={siswaData?.NO_TELP}
                                    />
                                    <InfoRow 
                                        icon="pi pi-heart-fill"
                                        label="Golongan Darah"
                                        value={siswaData?.GOL_DARAH}
                                    />
                                    <InfoRow 
                                        icon="pi pi-arrow-up"
                                        label="Tinggi Badan"
                                        value={siswaData?.TINGGI ? `${siswaData.TINGGI} cm` : '-'}
                                    />
                                    <InfoRow 
                                        icon="pi pi-circle"
                                        label="Berat Badan"
                                        value={siswaData?.BERAT ? `${siswaData.BERAT} kg` : '-'}
                                    />
                                </div>
                                {siswaData?.KEBUTUHAN_KHUSUS && (
                                    <div className="col-12">
                                        <Divider />
                                        <InfoRow 
                                            icon="pi pi-info-circle"
                                            label="Kebutuhan Khusus"
                                            value={siswaData.KEBUTUHAN_KHUSUS}
                                        />
                                    </div>
                                )}
                            </div>
                        </TabPanel>

                        {/* Tab Data Orang Tua */}
                        <TabPanel header="Data Orang Tua" leftIcon="pi pi-users mr-2">
                            <div className="grid">
                                {/* Data Ayah */}
                                <div className="col-12">
                                    <h5 className="text-blue-600 mb-3">
                                        <i className="pi pi-male mr-2"></i>Data Ayah
                                    </h5>
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-user"
                                        label="Nama Ayah"
                                        value={siswaData?.NAMA_AYAH}
                                    />
                                    <InfoRow 
                                        icon="pi pi-briefcase"
                                        label="Pekerjaan"
                                        value={siswaData?.PEKERJAAN_AYAH}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-book"
                                        label="Pendidikan"
                                        value={siswaData?.PENDIDIKAN_AYAH}
                                    />
                                    <InfoRow 
                                        icon="pi pi-phone"
                                        label="No. Telepon"
                                        value={siswaData?.NO_TELP_AYAH}
                                    />
                                </div>
                                <div className="col-12">
                                    <InfoRow 
                                        icon="pi pi-home"
                                        label="Alamat"
                                        value={siswaData?.ALAMAT_AYAH}
                                    />
                                </div>

                                <div className="col-12"><Divider /></div>

                                {/* Data Ibu */}
                                <div className="col-12">
                                    <h5 className="text-pink-600 mb-3">
                                        <i className="pi pi-female mr-2"></i>Data Ibu
                                    </h5>
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-user"
                                        label="Nama Ibu"
                                        value={siswaData?.NAMA_IBU}
                                    />
                                    <InfoRow 
                                        icon="pi pi-briefcase"
                                        label="Pekerjaan"
                                        value={siswaData?.PEKERJAAN_IBU}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <InfoRow 
                                        icon="pi pi-book"
                                        label="Pendidikan"
                                        value={siswaData?.PENDIDIKAN_IBU}
                                    />
                                    <InfoRow 
                                        icon="pi pi-phone"
                                        label="No. Telepon"
                                        value={siswaData?.NO_TELP_IBU}
                                    />
                                </div>
                                <div className="col-12">
                                    <InfoRow 
                                        icon="pi pi-home"
                                        label="Alamat"
                                        value={siswaData?.ALAMAT_IBU}
                                    />
                                </div>

                                {/* Data Wali (jika ada) */}
                                {siswaData?.NAMA_WALI && (
                                    <>
                                        <div className="col-12"><Divider /></div>
                                        <div className="col-12">
                                            <h5 className="text-orange-600 mb-3">
                                                <i className="pi pi-user-plus mr-2"></i>Data Wali
                                            </h5>
                                        </div>
                                        <div className="col-12 md:col-6">
                                            <InfoRow 
                                                icon="pi pi-user"
                                                label="Nama Wali"
                                                value={siswaData?.NAMA_WALI}
                                            />
                                            <InfoRow 
                                                icon="pi pi-briefcase"
                                                label="Pekerjaan"
                                                value={siswaData?.PEKERJAAN_WALI}
                                            />
                                        </div>
                                        <div className="col-12 md:col-6">
                                            <InfoRow 
                                                icon="pi pi-book"
                                                label="Pendidikan"
                                                value={siswaData?.PENDIDIKAN_WALI}
                                            />
                                            <InfoRow 
                                                icon="pi pi-phone"
                                                label="No. Telepon"
                                                value={siswaData?.NO_TELP_WALI}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <InfoRow 
                                                icon="pi pi-home"
                                                label="Alamat"
                                                value={siswaData?.ALAMAT_WALI}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabPanel>

                        {/* Tab Riwayat Kelas */}
                        <TabPanel header="Riwayat Kelas" leftIcon="pi pi-history mr-2">
                            {siswaData?.transaksi_siswa_kelas && siswaData.transaksi_siswa_kelas.length > 0 ? (
                                <div className="grid">
                                    {siswaData.transaksi_siswa_kelas.map((trx, index) => (
                                        <div key={index} className="col-12 md:col-6 lg:col-4">
                                            <Card className="shadow-2">
                                                <div className="text-center mb-3">
                                                    <Badge 
                                                        value={trx.tahun_ajaran?.NAMA_TAHUN_AJARAN || '-'} 
                                                        severity="info"
                                                        className="text-lg"
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
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="pi pi-info-circle" style={{ fontSize: '3rem', color: 'var(--text-color-secondary)' }}></i>
                                    <p className="text-600 mt-3">Belum ada riwayat kelas</p>
                                </div>
                            )}
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
        </div>
    );
};

export default ProfileSiswa;