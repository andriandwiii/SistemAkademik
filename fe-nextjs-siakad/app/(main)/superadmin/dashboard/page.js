'use client'

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { getUsers } from "../../superadmin/menu/users/utils/api";
import ToastNotifier from '@/app/components/ToastNotifier';

export default function DashboardPage() {
    const router = useRouter();
    const toastRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        roles: {},
        totalSiswa: 0,
        totalGuru: 0,
        totalKelas: 0,
        totalJurusan: 0,
        totalMataPelajaran: 0,
        totalJadwal: 0,
        siswaByStatus: {},
        guruByJabatan: {},
        jadwalByHari: {},
        kelasPerGedung: {},
    });

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("token");
        }
        return null;
    };

    useEffect(() => {
        const token = getToken();
        const storedName = localStorage.getItem("name");

        if (!token) {
            router.push("/");
        } else {
            if (storedName) setName(storedName);
            fetchAllStats(token);
        }
    }, [router]);

    const fetchAllStats = async (token) => {
        setLoading(true);
        try {
            const baseURL = process.env.NEXT_PUBLIC_API_URL;
            
            if (!baseURL) {
                throw new Error('API URL tidak dikonfigurasi');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch semua data secara paralel dengan error handling
            const fetchWithErrorHandling = async (endpoint) => {
                try {
                    const response = await fetch(`${baseURL}${endpoint}`, { headers });
                    if (!response.ok) {
                        console.error(`Error fetching ${endpoint}:`, response.status);
                        return { data: [] };
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error(`Error fetching ${endpoint}:`, error);
                    return { data: [] };
                }
            };

            const [
                users,
                siswaResponse,
                guruResponse,
                kelasResponse,
                jurusanResponse,
                tingkatanResponse,
                mataPelajaranResponse,
                jadwalResponse,
                jabatanResponse
            ] = await Promise.all([
                getUsers(token).catch(() => []),
                fetchWithErrorHandling('/siswa'),
                fetchWithErrorHandling('/master-guru'),
                fetchWithErrorHandling('/master-kelas'),
                fetchWithErrorHandling('/master-jurusan'),
                fetchWithErrorHandling('/master-tingkatan'),
                fetchWithErrorHandling('/master-mata-pelajaran'),
                fetchWithErrorHandling('/jadwal'),
                fetchWithErrorHandling('/master-jabatan')
            ]);

            // Process Users
            const totalUsers = users.length || 0;
            const activeUsers = users.filter(u => u.is_active !== false).length || 0;
            const inactiveUsers = totalUsers - activeUsers;
            const roles = {};
            users.forEach(u => {
                const roleName = u.role || 'Unassigned';
                roles[roleName] = (roles[roleName] || 0) + 1;
            });

            // Extract data arrays
            const siswaData = siswaResponse.data || [];
            const guruData = guruResponse.data || [];
            const kelasData = kelasResponse.data || [];
            const jurusanData = jurusanResponse.data || [];
            const tingkatanData = tingkatanResponse.data || [];
            const mataPelajaranData = mataPelajaranResponse.data || [];
            const jadwalData = jadwalResponse.data || [];

            // Process Siswa by Status
            const siswaByStatus = {};
            siswaData.forEach(s => {
                const status = s.STATUS || 'Unknown';
                siswaByStatus[status] = (siswaByStatus[status] || 0) + 1;
            });

            // Process Guru by Jabatan
            const guruByJabatan = {};
            guruData.forEach(g => {
                const jab = g.NAMA_JABATAN || g.KODE_JABATAN || 'Belum Ada Jabatan';
                guruByJabatan[jab] = (guruByJabatan[jab] || 0) + 1;
            });

            // Process Jadwal by Hari
            const jadwalByHari = {};
            jadwalData.forEach(j => {
                const hari = j.hari?.HARI || 'Unknown';
                jadwalByHari[hari] = (jadwalByHari[hari] || 0) + 1;
            });

            // Process Kelas per Gedung
            const kelasPerGedung = {};
            kelasData.forEach(k => {
                const gedung = k.gedung?.NAMA_GEDUNG || k.GEDUNG_ID || 'Unknown';
                kelasPerGedung[gedung] = (kelasPerGedung[gedung] || 0) + 1;
            });

            setStats({
                totalUsers,
                activeUsers,
                inactiveUsers,
                roles,
                totalSiswa: siswaData.length,
                totalGuru: guruData.length,
                totalKelas: kelasData.length,
                totalJurusan: jurusanData.length,
                totalMataPelajaran: mataPelajaranData.length,
                totalJadwal: jadwalData.length,
                siswaByStatus,
                guruByJabatan,
                jadwalByHari,
                kelasPerGedung,
            });

            toastRef.current?.showToast('00', 'Data dashboard berhasil dimuat');
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            toastRef.current?.showToast('01', `Gagal memuat data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Chart configurations
    const userRoleData = {
        labels: Object.keys(stats.roles),
        datasets: [{
            label: 'Users per Role',
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26A69A'],
            data: Object.values(stats.roles),
        }],
    };

    const siswaStatusData = {
        labels: Object.keys(stats.siswaByStatus),
        datasets: [{
            label: 'Siswa per Status',
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'],
            data: Object.values(stats.siswaByStatus),
        }],
    };

    const jadwalHariData = {
        labels: Object.keys(stats.jadwalByHari),
        datasets: [{
            label: 'Jadwal per Hari',
            backgroundColor: ['#673AB7', '#3F51B5', '#009688', '#4CAF50', '#FFC107'],
            data: Object.values(stats.jadwalByHari),
        }],
    };

    const kelasGedungData = {
        labels: Object.keys(stats.kelasPerGedung),
        datasets: [{
            label: 'Kelas per Gedung',
            backgroundColor: '#42A5F5',
            data: Object.values(stats.kelasPerGedung),
        }],
    };

    const chartOptions = { 
        plugins: { legend: { position: 'bottom' } }, 
        maintainAspectRatio: false 
    };

    if (loading) {
        return (
            <div className="grid">
                <ToastNotifier ref={toastRef} />
                <div className="col-12">
                    <Skeleton height="120px" className="mb-3" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-6">
                    <Skeleton height="350px" />
                </div>
                <div className="col-12 lg:col-6">
                    <Skeleton height="350px" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid p-fluid">
            <ToastNotifier ref={toastRef} />
            
            {/* Header Welcome */}
            <div className="col-12">
                <div className="card mb-3">
                    <div className="flex align-items-center justify-content-between">
                        <div>
                            <h4 className="m-0 mb-2">Selamat Datang, {name}!</h4>
                            <p className="text-500 m-0">Dashboard Sistem Informasi Manajemen Sekolah</p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                label="Refresh Data" 
                                icon="pi pi-refresh" 
                                className="p-button-sm p-button-outlined" 
                                onClick={() => fetchAllStats(getToken())} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards - Baris 1: Data Utama */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/siswa')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Siswa</span>
                            <div className="text-900 font-medium text-xl">{stats.totalSiswa}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-users text-blue-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Peserta didik terdaftar</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/guru')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Guru</span>
                            <div className="text-900 font-medium text-xl">{stats.totalGuru}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-id-card text-green-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Tenaga pendidik aktif</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/m.kelas')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Kelas</span>
                            <div className="text-900 font-medium text-xl">{stats.totalKelas}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-building text-orange-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Ruang kelas tersedia</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/mapel')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Mata Pelajaran</span>
                            <div className="text-900 font-medium text-xl">{stats.totalMataPelajaran}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-book text-purple-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Kurikulum aktif</small>
                </div>
            </div>

            {/* Summary Cards - Baris 2: Data Sekunder */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/jurusan')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Jurusan</span>
                            <div className="text-900 font-medium text-xl">{stats.totalJurusan}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-bookmark text-cyan-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Program keahlian</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/master/jadwal')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Jadwal Pelajaran</span>
                            <div className="text-900 font-medium text-xl">{stats.totalJadwal}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-pink-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-calendar text-pink-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Sesi pembelajaran</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300" onClick={() => router.push('/superadmin/menu/users')}>
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Users Aktif</span>
                            <div className="text-900 font-medium text-xl">{stats.activeUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-teal-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-check-circle text-teal-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Akun dapat login</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 cursor-pointer hover:shadow-3 transition-duration-300">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Users</span>
                            <div className="text-900 font-medium text-xl">{stats.totalUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-indigo-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-user text-indigo-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Semua akun sistem</small>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Distribusi Siswa per Status</h5>
                    <div className="flex justify-content-center" style={{ height: '300px' }}>
                        {Object.keys(stats.siswaByStatus).length > 0 ? (
                            <Chart type="pie" data={siswaStatusData} options={chartOptions} />
                        ) : (
                            <div className="flex align-items-center justify-content-center h-full text-500">
                                <div className="text-center">
                                    <i className="pi pi-chart-pie text-6xl mb-3"></i>
                                    <p>Tidak ada data siswa</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Distribusi Jadwal per Hari</h5>
                    <div className="flex justify-content-center" style={{ height: '300px' }}>
                        {Object.keys(stats.jadwalByHari).length > 0 ? (
                            <Chart type="doughnut" data={jadwalHariData} options={chartOptions} />
                        ) : (
                            <div className="flex align-items-center justify-content-center h-full text-500">
                                <div className="text-center">
                                    <i className="pi pi-chart-pie text-6xl mb-3"></i>
                                    <p>Tidak ada data jadwal</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Distribusi User per Role</h5>
                    <div className="flex justify-content-center" style={{ height: '300px' }}>
                        {Object.keys(stats.roles).length > 0 ? (
                            <Chart type="doughnut" data={userRoleData} options={chartOptions} />
                        ) : (
                            <div className="flex align-items-center justify-content-center h-full text-500">
                                <div className="text-center">
                                    <i className="pi pi-chart-pie text-6xl mb-3"></i>
                                    <p>Tidak ada data role</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Jumlah Kelas per Gedung</h5>
                    <div className="flex justify-content-center" style={{ height: '300px' }}>
                        {Object.keys(stats.kelasPerGedung).length > 0 ? (
                            <Chart type="bar" data={kelasGedungData} options={{
                                ...chartOptions,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 }
                                    }
                                }
                            }} />
                        ) : (
                            <div className="flex align-items-center justify-content-center h-full text-500">
                                <div className="text-center">
                                    <i className="pi pi-chart-bar text-6xl mb-3"></i>
                                    <p>Tidak ada data gedung</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="col-12">
                <div className="card">
                    <h5 className="mb-3">Menu Cepat</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6 lg:col-3">
                            <Button 
                                label="Kelola Siswa" 
                                icon="pi pi-users" 
                                className="w-full p-button-outlined" 
                                onClick={() => router.push('/master/siswa')} 
                            />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <Button 
                                label="Kelola Guru" 
                                icon="pi pi-id-card" 
                                className="w-full p-button-outlined" 
                                onClick={() => router.push('/master/guru')} 
                            />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <Button 
                                label="Kelola Jadwal" 
                                icon="pi pi-calendar" 
                                className="w-full p-button-outlined" 
                                onClick={() => router.push('/master/jadwal')} 
                            />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <Button 
                                label="Kelola Users" 
                                icon="pi pi-cog" 
                                className="w-full p-button-outlined" 
                                onClick={() => router.push('/superadmin/menu/users')} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Informasi Sistem</h5>
                    <div className="text-500">
                        <div className="flex justify-content-between mb-2">
                            <span>Total Siswa Aktif:</span>
                            <span className="font-medium text-900">{stats.siswaByStatus['Aktif'] || 0}</span>
                        </div>
                        <div className="flex justify-content-between mb-2">
                            <span>Total Guru:</span>
                            <span className="font-medium text-900">{stats.totalGuru}</span>
                        </div>
                        <div className="flex justify-content-between mb-2">
                            <span>Total Kelas:</span>
                            <span className="font-medium text-900">{stats.totalKelas}</span>
                        </div>
                        <div className="flex justify-content-between">
                            <span>Total Jadwal:</span>
                            <span className="font-medium text-900">{stats.totalJadwal}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6">
                <div className="card">
                    <h5 className="mb-3">Tips Administrator</h5>
                    <p className="text-sm text-500 line-height-3">
                        Pastikan data siswa, guru, dan jadwal selalu ter-update. 
                        Lakukan backup data secara berkala dan periksa konsistensi 
                        data antar tabel untuk menjaga integritas sistem.
                    </p>
                    <Button 
                        label="Lihat Dokumentasi" 
                        icon="pi pi-book" 
                        className="p-button-sm p-button-text mt-2" 
                    />
                </div>
            </div>
        </div>
    );
}
